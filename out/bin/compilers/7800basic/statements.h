// Provided under the GPL v2 license. See the included LICENSE.txt for details.

#define _readpaddle 1
#define _background 64
#define MAX_EXTRAS 5
#define SIZEOFSTATEMENT 200
#define STATEMENTCOUNT  200

#define MODE160A 0
#define MODE160B 1
#define MODE320A 2
#define MODE320B 4
#define MODE320C 8
#define MODE320D 16

#include <stdio.h>

int linenum ();
int getcondpart ();
void add_inline (char *myinclude);
void alphachars (char **statement);
void backup(char **statement);
void drawwait (void);
void domemset (char **statement);
void doasm ();
void dopop ();
void doreboot ();
void incmapfile (char **statement);
void incrmtfile (char **statement);
void domacro (char **statement);
void callmacro (char **statement);
void doextra (char *extrano);
void shiftdata (char **statement, int num);
int getgraphicheight (char *file_name);
int bbgetline ();
void doend ();
void freemem (char **statement);
int findpoint (char *item);
int strictatoi (char *numstring);
void printindex (char *, int, int);
void loadindex (char *, int);
void jsr (char *);
int islabel (char **);
int islabelelse (char **);
int findlabel (char **, int i);
void add_includes (char *);
void create_includes (char *);
void incline ();
void fixfilename (char *);
void init_includes ();
void invalidate_Areg ();
void shiftdata (char **, int);
void compressdata (char **, int, int);
void data (char **);
void speechdata (char **);
void songdata (char **);
void stopsong ();
void playsong (char **);
void stoprmt ();
void startrmt ();
void playrmt (char **);
void printphonemes (char *, int, int);
void speak (char **);
void sdata (char **);
void alphadata (char **);
void sinedata (char **);
int lookupcharacter (char);
void function (char **);
void endfunction ();
void callfunction (char **);
void ongoto (char **);
void doreturn (char **);
void clearscreen (void);
void tsound (char **);
void psound (char **);
void playsfx (char **);
void mutesfx (char **);
void doconst (char **);
void dim (char **);
void dofor (char **);
void mul (char **, int);
void divd (char **, int);
void next (char **);
void adjustvisible (char **);
void gosub (char **);
void doif (char **);
void domemcpy (char **);
void pokechar (char **);
void setfade (char **statement);
void let (char **);
void dec (char **);
void bank (char **);
void dmahole (char **);
void rem (char **);
void echo (char **);
void set (char **);
void dogoto (char **);
void drawhiscores (char **);
void hiscoreload (char **);
void hiscoreclear (char **);
void loadmemory (char **);
void savememory (char **);
void loadrombank (char **);
void loadrambank (char **);
char *ourbasename (char *);
void add_graphic (char **, int bannergraphic);
void boxcollision (char **);
void dash2underscore (char *mystring);
void plotbanner (char **statement);
void plotsprite (char **statement, int fourbytesprite);
void PLOTSPRITE (char **statement, int fourbytesprite);
void plotchars (char **statement);
void plotmap (char **statement);
void plotmapfile (char **statement);
void plotvalue (char **statement);
void displaymode (char **statement);
void ifconst (char **statement);
void incbin (char **statement);
void doelse (void);
void endif (void);
void dosizeof (char **statement);
void lockzone (char **statement);
void unlockzone (char **statement);
void shakescreen (char **statement);
void changecontrol (char **statement);
void snesdetect ();
int inlinealphadata (char **statement);
void incgraphic (char *file_name, int offset);
void newblock ();
void voice (char **statement);
int getgraphicwidth (char *file_name);
void characterset (char **statement);
void savescreen (void);
void restorescreen (void);
void barf_graphic_file (void);
void lastrites(void);
void gfxprintf (char *format, ...);
void orgprintf (char *format, ...);
void barfmultiplicationtables (void);
void append_a78info (char *);
void create_a78info (void);
void drawscreen (void);
void doublebuffer (char **statement);
void prerror (char *, ...);
void prwarn (char *, ...);
void prinfo (char *, ...);
void remove_trailing_commas (char *);
void removeCR (char *);
void bmi (char *);
void bpl (char *);
void bne (char *);
void beq (char *);
void bcc (char *);
void bcs (char *);
void bvc (char *);
void bvs (char *);
int printimmed (char *);
int isimmed (char *);
int number (unsigned char);
void header_open (FILE *);
void header_write (FILE *, char *);
