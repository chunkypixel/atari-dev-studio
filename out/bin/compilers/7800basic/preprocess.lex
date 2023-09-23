%{
#include <stdlib.h>  
int linenumber=1;
//void yyerror(char *);  
%}    
%option nounput
%option noinput
%x scomment
%x mcomment
%x endmcomment
%x comment
%x asm
%x data
%x sdata
%x alphachars
%x domemset
%x alphadata
%x speechdata
%x speechquotestart
%x songdata
%x songquotestart
%x plotchars
%x plotquotestart
%x player
%x lives
%x playercolor
%x scorecolors
%x includes
%x incgraphic
%x incbanner
%x incmapfile
%x plotmapfile
%x set
%x setquotestart
%x backup
%x backupquotestart
%%    
[ \t]+ putchar(' ');
[ \t\r]+$

[ \t\r]+";" {BEGIN(scomment);}
";" {BEGIN(scomment);}
<scomment>. ;
<scomment>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

[ \t\r]+"/*" {BEGIN(mcomment);}
"/*" {BEGIN(mcomment);}
<mcomment>"*/" {BEGIN(INITIAL);}
<mcomment>. ;
<mcomment>\n {linenumber++;printf("\n");}

"rem" {printf("rem");BEGIN(comment);}
"echo" {printf("echo");BEGIN(comment);}
<comment>^\n* printf("%s",yytext);
<comment>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

<endmcomment>. ;
<endmcomment>\n {linenumber++;BEGIN(INITIAL);}

"_asm"            printf("%s", yytext);  
"asm" {printf("%s",yytext);BEGIN(asm);}
<asm>"\nend" {linenumber++;printf("\nend");BEGIN(INITIAL);}
<asm>"\n" {linenumber++;printf("\n");}

"_sdata"            printf("%s", yytext);  
"sdata" {printf("%s",yytext);BEGIN(sdata);}
<sdata>"=" printf(" %s ", yytext);  
<sdata>[ \t]+ putchar(' ');
<sdata>^"\nend" printf("%s",yytext);
<sdata>"\nend" {linenumber++;printf("\nend");BEGIN(INITIAL);}
<sdata>"\n" {linenumber++;printf("\n");}

"_data"            printf("%s", yytext);  
"data" {printf("%s",yytext);BEGIN(data);}
<data>^"\nend" printf("%s",yytext);
<data>"\nend" {linenumber++;printf("\nend");BEGIN(INITIAL);}
<data>"\n" {linenumber++;printf("\n");}

"alphachars" {printf("%s",yytext);BEGIN(alphachars);}
<alphachars>'.*' printf("%s",yytext);
<alphachars>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

"memset" {printf("%s",yytext);BEGIN(domemset);}
<domemset>'.*' printf("%s",yytext);
<domemset>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

"alphadata" {printf("%s",yytext);BEGIN(alphadata);}
<alphadata>^"\nend" printf("%s",yytext);
<alphadata>"\nend" {linenumber++;printf("\nend");BEGIN(INITIAL);}
<alphadata>"\n" {linenumber++;printf("\n");}

"_speechdata"            printf("%s", yytext);  
"speechdata" {printf("%s",yytext);BEGIN(speechdata);}
<speechdata>['] {printf("%s",yytext);BEGIN(speechquotestart);}
<speechdata>^"\nend" printf("%s",yytext);
<speechdata>"\nend" {linenumber++;printf("\nend");BEGIN(INITIAL);}
<speechdata>[ \t]+ putchar(' ');
<speechdata>[ \t\r]+$
<speechdata>"\n" {linenumber++;printf("\n");}

<speechquotestart>[ \t] putchar('^');
<speechquotestart>['] {printf("%s",yytext);BEGIN(speechdata);}
<speechquotestart>^\n* printf("%s",yytext);

"_songdata"            printf("%s", yytext);  
"songdata" {printf("%s",yytext);BEGIN(songdata);}
<songdata>['] {printf("%s",yytext);BEGIN(songquotestart);}
<songdata>^"\nend" printf("%s",yytext);
<songdata>"\nend" {linenumber++;printf("\nend");BEGIN(INITIAL);}
<songdata>[ \t]+ putchar(' ');
<songdata>[ \t\r]+$
<songdata>"\n" {linenumber++;printf("\n");}

<songquotestart>[ \t] putchar('^');
<songquotestart>['] {printf("%s",yytext);BEGIN(songdata);}
<songquotestart>^\n* printf("%s",yytext);

"plotchars" {printf("%s",yytext);BEGIN(plotchars);}
<plotchars>['] {printf("%s",yytext);BEGIN(plotquotestart);}
<plotchars>[ \t]+ putchar(' ');
<plotchars>[ \t\r]+$
<plotchars>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

<plotquotestart>[ \t] putchar('^');
<plotquotestart>['] {printf("%s",yytext);BEGIN(INITIAL);}
<plotquotestart>^\n* printf("%s",yytext);

"_include"            printf("%s", yytext);  
"include" {printf("%s",yytext);BEGIN(includes);}
<includes>^\n* printf("%s",yytext);
<includes>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

"incgraphic" {printf("%s",yytext);BEGIN(incgraphic);}
<incgraphic>^\n* printf("%s",yytext);
<incgraphic>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

"incbanner" {printf("%s",yytext);BEGIN(incbanner);}
<incbanner>^\n* printf("%s",yytext);
<incbanner>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

"incmapfile" {printf("%s",yytext);BEGIN(incmapfile);}
<incmapfile>^\n* printf("%s",yytext);
<incmapfile>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

"plotmapfile" {printf("%s",yytext);BEGIN(plotmapfile);}
<plotmapfile>^\n* printf("%s",yytext);
<plotmapfile>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

"_set"            printf("%s", yytext);  
"set" {printf("%s",yytext);BEGIN(set);}
<set>['] {printf("%s",yytext);BEGIN(setquotestart);}
<set>^\n* printf("%s",yytext);
<set>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

<setquotestart>[ \t] putchar('^');
<setquotestart>['] {printf("%s",yytext);BEGIN(set);}
<setquotestart>^\n* printf("%s",yytext);

"backup" {printf("%s",yytext);BEGIN(backup);}
<backup>['] {printf("%s",yytext);BEGIN(backupquotestart);}
<backup>^\n* printf("%s",yytext);
<backup>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

<backupquotestart>[ \t] putchar('^');
<backupquotestart>['] {printf("%s",yytext);BEGIN(set);}
<backupquotestart>^\n* printf("%s",yytext);

".asm" printf("%s",yytext);
"extra"[0-9]+: printf("%s",yytext);
"step"[ ]+"-" printf("step -");
"#"            printf("%s", yytext);  
"$"            printf("%s", yytext);  
"%"            printf("%s", yytext);  
"["            printf("%s", yytext);  
"]"            printf("%s", yytext);  
"!"            printf("%s", yytext);  
"."            printf("%s", yytext);  
"_"            printf("%s", yytext);  
"{"          printf("%s", yytext);  
"}"          printf("%s", yytext);  


","            printf(" %s ", yytext);  
"("            printf(" %s ", yytext);  
")"            printf(" %s ", yytext);  
">="            printf(" %s ", yytext);  
"<="            printf(" %s ", yytext);  
"="            printf(" %s ", yytext);  
"<>"            printf(" %s ", yytext);  
"<"            printf(" %s ", yytext);  
"+"            printf(" %s ", yytext);  
"-"            printf(" %s ", yytext);  
"/"+            printf(" %s ", yytext);  
"*"+            printf(" %s ", yytext);  
">"            printf(" %s ", yytext);  
":"            printf(" %s ", yytext);  
"&"+          printf(" %s ", yytext);  
"|"+          printf(" %s ", yytext);  
"^"          printf(" %s ", yytext);  

[A-Z]+ printf("%s",yytext);
[a-z]+       {       printf("%s", yytext);}
[0-9]+      {       printf("%s", yytext);}
[\n] {printf("\n"); linenumber++;}
.               {fprintf(stderr,"(%d) Parse error: unrecognized character \"%s\"\n",linenumber,yytext);  exit(1);}
%%
  int yywrap(void) {      return 1;  } 
extern int yy_flex_debug;
int main(){yy_flex_debug = 1;yylex();}
