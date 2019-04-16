static char includespath[500];
static int ongosub;
static int condpart;
static int ROMpf;
static int smartbranching;
static int sprites_barfed;
static int superchip;
static int bank=1;
static int decimal=0; //REVENG - decimal mode flag 
static int last_bank;
static int includesfile_already_done=0;
static int bs;
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
static int pfdata[50][256];
static char forvar[50][50];
static char forlabel[50][50];
static char forstep[50][50];
static char forend[50][50];
static char fixpoint44[2][50][50];
static char fixpoint88[2][50][50];
//static int numgosubs;
void keywords(char **);
static char redefined_variables[500][100];
static char constants[500][100];
static int pfcolorindexsave;
static int pfcolornumber;
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
//static char **tia_write_regs= //note: not needed now, maybe later
//{"VSYNC","VBLANK","WSYNC","RSYNC","NUSIZ0","NUSIZ1","COLUP0","COLUP1","COLUPF","COLUBK",
//"CTRLPF","REFP0","REFP1","PF0","PF1","PF2","RESP0","RESP1","RESM0","RESM1","RESBL","AUDC0",
//"AUDC1","AUDF0","AUDF1","AUDV0","AUDV1","GRP0","GRP1","ENAM0,"ENAM1,"ENABL,"HMP0","HMP1",
//"HMM0","HMM1","HMBL","VDELP0","VDELP1","VDELBL","RESMP0","RESMP1","HMOVE","HMCLR","CXCLR","done"};
