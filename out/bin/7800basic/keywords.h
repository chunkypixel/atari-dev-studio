
static char includespath[500];
static char incbasepath[500] = { 0 } ;
static int ongosub;
static int condpart;
static int smartbranching = 1;
static int collisionwrap = 0;
static int sprites_barfed;
static int superchip;
static int decimal=0;
static int romat4k=0;
static int includesfile_already_done=0;
static int bankcount=0;
static int currentbank=0;
static int doublebufferused=0;
static int multisprite;
static int lifekernel;
static int numfors;
static int extra;
static int extralabel;
static int extraactive;
static int macroactive;
static char user_includes[1000];
static char sprite_data[5000][50];
static int sprite_index;
static int playfield_index[50];
static int playfield_number;
static char forvar[50][50];
static char forlabel[50][50];
static char forstep[50][50];
static char forend[50][50];
static char fixpoint44[2][50][50];
static char fixpoint88[2][50][50];
static char multtablename[100][100];
static int multtablewidth[100];
static int multtableheight[100];
static int multtableindex=0;
//static int numgosubs;
void keywords(char **);
static char redefined_variables[10000][100];
static char constants[10000][100];
static char bannerfilenames[1000][100] = { {0} };
static int bannerheights[1000];
static char palettefilenames[1000][100] = { {0} };
static int graphicfilepalettes[1000];
static int graphicfilemodes[1000];
static int kernel_options;
static int numfixpoint44;
static int numfixpoint88;
static int numredefvars;
static int optimization;
static int numconstants;
static int numthens;
static int ors;
static int line;
static int numjsrs;
static int numelses;
static int doingfunction;
static char Areg[50];
static int branchtargetnumber;
static unsigned char graphicsdata[16][256][100];
static char graphicslabels[16][256][80];
static unsigned char graphicsinfo[16][256];
static unsigned char graphicsmode[16][256];
static char currentcharset[256] = { '\0' };
static int graphicsdatawidth[16] = { 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
static char charactersetchars[257] = { 	' ','a','b','c','d','e','f','g','h','i','j','k','l','m',
					'n','o','p','q','r','s','t','u','v','w','x','y','z','.',
					'!','?',',','"','$','(',')',':','\0' };
static int dmaplain=0;
static int templabel=0;
static int doublewide=0;
static int zoneheight=16;
static int zonelocking=0;

//static char **tia_write_regs= //note: not needed now, maybe later
//{"VSYNC","VBLANK","WSYNC","RSYNC","NUSIZ0","NUSIZ1","COLUP0","COLUP1","COLUPF","COLUBK",
//"CTRLPF","REFP0","REFP1","PF0","PF1","PF2","RESP0","RESP1","RESM0","RESM1","RESBL","AUDC0",
//"AUDC1","AUDF0","AUDF1","AUDV0","AUDV1","GRP0","GRP1","ENAM0,"ENAM1,"ENABL,"HMP0","HMP1",
//"HMM0","HMM1","HMBL","VDELP0","VDELP1","VDELBL","RESMP0","RESMP1","HMOVE","HMCLR","CXCLR","done"};
