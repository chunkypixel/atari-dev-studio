// Provided under the GPL v2 license. See the included LICENSE.txt for details.
//
// A minimal cross-platform tar implementation, for 7800basic project backup.
//
// This code is only suitable for backup+restore from a non-privileged user 
// account. There are hardcoded limiations, which shouldn't be an issue for
// it's intended purpose:
//
//   * The only supported filetypes are files and directories.
//   * The archived user and group ownershp is alwasy "7800bas:7800bas"
//   * The archived permissions are alwasy directories=755 and files=644.
//   * The archived timestamp is the time of tar file creation, not the file's
//     actual creation date.
//   * Only relative paths are supported. If an absolute path is submitted,
//     the leading / will be removed.

#include <stdlib.h>
#include <stdio.h>
#include <time.h>
#include <string.h>

#ifndef TRUE
#define TRUE (1==1)
#endif
#ifndef FALSE
#define FALSE (1==0)
#endif

#define DIRMAX 200

char tarfilename[1000];
char directories[DIRMAX][1024];
FILE *outfile = NULL;

#define BACKUPSTYLE_SINGLE  0
#define BACKUPSTYLE_RUNNING 1

int SetBackupStyle(int style);
int OpenArchive(char *outfilename);
int AddToArchive(char *filename,int isfile);
void CloseArchive();

int backup_style = BACKUPSTYLE_RUNNING;

struct posix_header
{                              /* byte offset */
  char name[100];               /*   0 */
  char mode[8];                 /* 100 */
  char uid[8];                  /* 108 */
  char gid[8];                  /* 116 */
  char size[12];                /* 124 */
  char mtime[12];               /* 136 */
  char chksum[8];               /* 148 */
  char typeflag;                /* 156 */
  char linkname[100];           /* 157 */
  char magic[6];                /* 257 */
  char version[2];              /* 263 */
  char uname[32];               /* 265 */
  char gname[32];               /* 297 */
  char devmajor[8];             /* 329 */
  char devminor[8];             /* 337 */
  char prefix[155];             /* 345 */
                                /* 500 */
  char unused[12];              /* 512 */
} ourblock;


int SetBackupStyle(int style)
{
	backup_style = style;
}

int OpenArchive(char *outfilename)
{
	char buffer[1000];
	int t;
	for(t=0;t<DIRMAX;t++)
		directories[t][0]=0;

	if(backup_style==BACKUPSTYLE_RUNNING)
	{
		// get current time, which we'll add to the filename
		time_t our_time = time(NULL);
		struct tm *local_time = localtime(&our_time);
		strftime(buffer, 1024, "%Y%m%d_%H%M%S", local_time);
		snprintf(tarfilename,1024,"%s.%s.tar",outfilename,buffer);
	}
	else // BACKUPSTYLE_SINGLE
	{
		snprintf(tarfilename,1024,"%s.tar",outfilename);
	}

	outfile=fopen(tarfilename,"wb");
	if(outfile==NULL)
		return(FALSE);
	return(TRUE);
}

int RememberDir(char *dirname)
{
	int t;
	for(t=0;t<DIRMAX;t++)
	{
		if(directories[t][0]==0)
		{
			strncpy(directories[t],dirname,1024);
			return(FALSE);
		}
		if(strcmp(directories[t],dirname)==0)
			return(TRUE);
	}
	return(TRUE);
}

int AddToArchive(char *filename,int isfile)
{
	// Scan the filename for / or \ folder markers.

	char *unixslash,*winslash, *slash;
	char savechar;

	FILE *filetoadd;
	int filesize;

	if((filename[0]=='/')||(filename[0]=='\\')) // absolute path?
		filename++; // strip to relative path

	if(isfile)
	{

		// check our file is readable, and grab it's size for later
		filetoadd=fopen(filename,"rb");
		if(filetoadd==NULL)
			return(FALSE);
		fseek(filetoadd,0,SEEK_END);
		filesize=ftell(filetoadd);
		fseek(filetoadd,0,SEEK_SET);

		// if a path is present, we need to archive the path dirs first
		winslash=strchr(filename,'\\');
		unixslash=strchr(filename,'/');
		slash=(winslash>unixslash) ? winslash : unixslash;
		while(slash!=NULL)
		{
			*slash='/';
			slash++; // include slash in archive
			savechar=*slash;
			*slash=0;
			if(RememberDir(filename)==FALSE)
				AddToArchive(filename,FALSE);
			*slash=savechar;
			winslash=strchr(slash+1,'\\');
			unixslash=strchr(slash+1,'/');
			slash=(winslash>unixslash) ? winslash : unixslash;
		}
	}

	// setup the header for this file...
	memset(ourblock.name,0,100);
	strncpy(ourblock.name,filename,100);
	strncpy(ourblock.magic,"ustar ",6);
	snprintf(ourblock.uid,8,"%07o",1000); // just a dummy uid
	snprintf(ourblock.gid,8,"%07o",1000); // just a dummy gid
	snprintf(ourblock.mtime,12,"%011lo",time(NULL));
	memset(ourblock.linkname,0,100);
	strncpy(ourblock.version," ",2);
	memset(ourblock.uname,0,32);
	strncpy(ourblock.uname,"7800bas",8);
	memset(ourblock.gname,0,32);
	strncpy(ourblock.gname,"7800bas",8);
	memset(ourblock.devmajor,0,8);
	memset(ourblock.devminor,0,8);
	memset(ourblock.unused,0,12);
	if(isfile)
	{
		snprintf(ourblock.size,12,"%011o",filesize);
		strncpy(ourblock.mode,"0000664",8);
		ourblock.typeflag='0'; // regular file
	}
	else
	{
		strncpy(ourblock.size,"00000000000",12);
		strncpy(ourblock.mode,"0000775",8);
		ourblock.typeflag='5'; // directory
	}

	// Now that our block is complete, calculate the checksum.
	strncpy(ourblock.chksum,"        ",8);
	unsigned int checkval=0;
	int t;
	unsigned char *blockpoint = (unsigned char *)&ourblock;
	for(t=0;t<512;t++)
	{
		checkval+=blockpoint[t];
	}
	snprintf(ourblock.chksum,7,"%06o",checkval);

	// Now add the block to the tar file...
	fwrite(&ourblock,1,512,outfile);
	if(isfile)
	{
		char *filebuf;
		int roundupsize=(filesize+511)&(~511);
		filebuf=malloc(roundupsize);
		memset(filebuf,0,roundupsize);
		//copy the file into the archive...
		fread(filebuf,1,filesize,filetoadd);
		fwrite(filebuf,1,roundupsize,outfile);
		fclose(filetoadd);
		free(filebuf);
	}
	return(TRUE);
}

void CloseArchive()
{
	char buffer[1024];
	memset(buffer,0,1024);
	fwrite(buffer,1,1024,outfile);
	fclose(outfile);
}
