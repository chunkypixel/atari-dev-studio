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

"asm" {printf("%s",yytext);BEGIN(asm);}
<asm>"\nend" {linenumber++;printf("\nend");BEGIN(INITIAL);}
<asm>"\n" {linenumber++;printf("\n");}

"sdata" {printf("%s",yytext);BEGIN(sdata);}
<sdata>"=" printf(" %s ", yytext);  
<sdata>[ \t]+ putchar(' ');
<sdata>^"\nend" printf("%s",yytext);
<sdata>"\nend" {linenumber++;printf("\nend");BEGIN(INITIAL);}
<sdata>"\n" {linenumber++;printf("\n");}

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

"set" {printf("%s",yytext);BEGIN(set);}
<set>['] {printf("%s",yytext);BEGIN(setquotestart);}
<set>^\n* printf("%s",yytext);
<set>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

<setquotestart>[ \t] putchar('^');
<setquotestart>['] {printf("%s",yytext);BEGIN(set);}
<setquotestart>^\n* printf("%s",yytext);

"player"[0123456789-]+: {printf("%s",yytext);BEGIN(player);}
<player>^"\nend" printf("%s",yytext);
<player>"\nend" {linenumber++;printf("\nend");BEGIN(INITIAL);}
<player>"\n" {linenumber++;printf("\n");}

"lives:" {printf("%s",yytext);BEGIN(lives);}
<lives>^"\nend" printf("%s",yytext);
<lives>"\nend" {linenumber++;printf("\nend");BEGIN(INITIAL);}
<lives>"\n" {linenumber++;printf("\n");}

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
int main(){yylex();}
