#define BACKUPSTYLE_SINGLE  0
#define BACKUPSTYLE_RUNNING 1

int SetBackupStyle(int style);
int OpenArchive(char *outfilename);
int AddToArchive(char *filename,int isfile);
void CloseArchive();

