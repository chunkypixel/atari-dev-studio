#include <stdio.h>

#define BASEMEM 0x1880
#define ENDMEM  0x2000

void main()
{
	printf("  if WZONEHEIGHT = 8\n");
	printf("  if WSCREENHEIGHT = 192\n");
	zonedata(24);
	printf("  endif ; 192 (8)\n");
	printf("\n");

	printf("  if WSCREENHEIGHT = 208\n");
	zonedata(28);
	printf("  endif ; 208 (8)\n");
	printf("\n");

	printf("  if WSCREENHEIGHT = 224\n");
	zonedata(32);
	printf("  endif ; 224 (8)\n");
	printf("  endif ; 8\n");
	printf("\n");

	printf("  if WZONEHEIGHT = 16\n");
	printf("  if WSCREENHEIGHT = 192\n");
	zonedata(12);
	printf("  endif ; 192 (16)\n");
	printf("\n");

	printf("  if WSCREENHEIGHT = 208\n");
	zonedata(13);
	printf("  endif ; 208 (16)\n");
	printf("\n");

	printf("  if WSCREENHEIGHT = 224\n");
	zonedata(14);
	printf("  endif ; 224 (16)\n");
	printf("  endif ; 16\n");
	}

zonedata(int ZONECOUNT)
{

 int t;
 int DLSIZE=((ENDMEM-BASEMEM)/ZONECOUNT)-2; // -2 to account for the 2 byte DL terminator
 DLSIZE=DLSIZE-(DLSIZE%5);
 printf("DLPOINTH\n");
 printf("   .byte ");
 for (t=0;t<ZONECOUNT;t++)
 {
     if (((t%(ZONECOUNT/2))==0)&&(t>0)&&(ZONECOUNT>20))
 			printf("\n   .byte ");
     else if (t>0)
        printf(",");
     printf("$%02x",(BASEMEM+(t*DLSIZE)+(2*t))>>8);
 }
 printf("\n");
 printf("DLPOINTL\n");
 printf("   .byte ");
 for (t=0;t<ZONECOUNT;t++)
 {
     if (((t%(ZONECOUNT/2))==0)&&(t>0)&&(ZONECOUNT>20))
 			printf("\n   .byte ");
     else if (t>0)
        printf(",");
     printf("$%02x",(BASEMEM+(t*DLSIZE)+(2*t))&255);
 }
 printf("\n");

 printf("   ; last byte used in DLL: %04x\n",BASEMEM+(ZONECOUNT*DLSIZE)+(ZONECOUNT*2)-1);
 printf("   ; max number of objects per DL: %0d\n",DLSIZE/5);
 printf("DLLASTOBJ = %d\n",DLSIZE);

 printf("DLHEIGHT\n");
 printf("   .byte ");
 for (t=0;t<ZONECOUNT;t++)
 {
     if (((t%(ZONECOUNT/2))==0)&&(t>0)&&(ZONECOUNT>20))
 			printf("\n   .byte ");
     else if (t>0)
        printf(",");
     if(ZONECOUNT>20)
       printf("$07");
     else
       printf("$1F");
 }

 printf("\n");
}
