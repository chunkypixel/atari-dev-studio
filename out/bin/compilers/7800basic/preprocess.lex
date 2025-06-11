%{
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int linenumber=1;
//void yyerror(char *);

#define MAX_INCLUDE_DEPTH 10
YY_BUFFER_STATE include_stack[MAX_INCLUDE_DEPTH]; // Stores buffer states
FILE *file_stack[MAX_INCLUDE_DEPTH];              // Stores FILE* pointers for closing and yyin restoration
int include_stack_ptr = 0;

// Helper function to handle the file opening and buffer switching logic
void handle_include_file(const char* filename_yytext, int filename_len) {
    char actual_filename[256];
    size_t len_to_copy;

    // Strip quotes if present
    if (filename_yytext[0] == '"' && filename_len > 1 && filename_yytext[filename_len-1] == '"') {
        if (filename_len > 2) { 
            len_to_copy = filename_len - 2;
            if (len_to_copy >= sizeof(actual_filename)) {
                len_to_copy = sizeof(actual_filename) - 1;
                fprintf(stderr, "(%d) Warning: Quoted filename too long, truncated: %s\n", linenumber, filename_yytext);
            }
            strncpy(actual_filename, filename_yytext + 1, len_to_copy);
            actual_filename[len_to_copy] = '\0';
        } else { // Filename was just ""
            actual_filename[0] = '\0';
        }
    } else { // Unquoted
        len_to_copy = filename_len;
        if (len_to_copy >= sizeof(actual_filename)) {
            len_to_copy = sizeof(actual_filename) - 1;
            fprintf(stderr, "(%d) Warning: Unquoted filename too long, truncated: %s\n", linenumber, filename_yytext);
        }
        strncpy(actual_filename, filename_yytext, len_to_copy);
        actual_filename[len_to_copy] = '\0';
    }

    if (actual_filename[0] == '\0') {
        fprintf(stderr, "(%d) Error: Empty filename provided for 'incbasic'.\n", linenumber);
        return;
    }

    if (include_stack_ptr >= MAX_INCLUDE_DEPTH) {
        fprintf(stderr, "(%d) Error: Maximum include depth (%d) exceeded for file '%s'.\n", linenumber, MAX_INCLUDE_DEPTH, actual_filename);
        return; 
    }

    FILE *new_file = fopen(actual_filename, "r");
    if (!new_file) {
        fprintf(stderr, "(%d) Error: Could not open include file '%s'.\n", linenumber, actual_filename);
        perror("fopen error"); // Print system error for more details
        return; 
    }

    // Save the current input source (FILE*) and buffer state
    file_stack[include_stack_ptr] = yyin; 
    include_stack[include_stack_ptr] = YY_CURRENT_BUFFER; // Correct: Use YY_CURRENT_BUFFER to get current state
    include_stack_ptr++;

    // Set yyin to the new file
    yyin = new_file;
    // Create a new buffer for the new file and switch to it
    yy_switch_to_buffer(yy_create_buffer(yyin, YY_BUF_SIZE)); 
    
    // Optional: Reset linenumber for the new file. 
    // If you want per-file line numbers, you'd save/restore 'linenumber' too.
    // linenumber = 1; // Example: reset for each new file
}

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
%x strcpy 
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
%x inccompress
%x plotmapfile
%x set
%x setquotestart
%x backup
%x backupquotestart
%x incbasic_ws_before_fname
%x incbasic_fname_parsed

%%    
[ \t]+ putchar(' ');
[ \t\r]+$

^[ \t]*"incbasic" { 
    printf("%s", yytext); 
    BEGIN(incbasic_ws_before_fname);
}

<incbasic_ws_before_fname>[ \t]+ { 
    printf("%s", yytext); 
}

<incbasic_ws_before_fname>\"[^\"\n]+\" { 
    printf("%s", yytext); 
    handle_include_file(yytext, yyleng);
    BEGIN(incbasic_fname_parsed); 
}

<incbasic_ws_before_fname>[^ \t\n\"]+ { 
    printf("%s", yytext); 
    handle_include_file(yytext, yyleng);
    BEGIN(incbasic_fname_parsed); 
}

<incbasic_ws_before_fname>\n { 
    fprintf(stderr, "(%d) Warning: 'incbasic' without a filename.\n", linenumber);
    linenumber++;
    printf("\n");
    BEGIN(INITIAL);
}

<incbasic_ws_before_fname>. { 
    fprintf(stderr, "(%d) Warning: Unexpected char '%s' after 'incbasic' where filename was expected. Treating as end of incbasic command.\n", linenumber, yytext);
    printf("%s", yytext); 
    BEGIN(incbasic_fname_parsed); // Or BEGIN(INITIAL); and re-evaluate the character
}

<incbasic_fname_parsed>[ \t]+ { 
    printf("%s", yytext); 
}

<incbasic_fname_parsed>\n {
    linenumber++;
    printf("\n"); 
    BEGIN(INITIAL); 
}

<incbasic_fname_parsed>. { 
    fprintf(stderr, "(%d) Warning: Unexpected characters '%s' after filename on 'incbasic' line.\n", linenumber, yytext);
    printf("%s", yytext); 
}

[ \t\r]+";" {BEGIN(scomment);}
";" {BEGIN(scomment);}
<scomment>.[^\n]* 
<scomment>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

[ \t\r]+"/*" {BEGIN(mcomment);}
"/*" {BEGIN(mcomment);}
<mcomment>"*/" {BEGIN(INITIAL);}
<mcomment>. ; 
<mcomment>\n {linenumber++;printf("\n");} 

"rem" {printf("rem");BEGIN(comment);}
"echo" {printf("echo");BEGIN(comment);}
<comment>[^\n]* {printf("%s",yytext);} 
<comment>\n {linenumber++;printf("\n");BEGIN(INITIAL);}


<endmcomment>. ;
<endmcomment>\n {linenumber++;BEGIN(INITIAL);}

"_asm"            printf("%s", yytext);  
"asm" {printf("%s",yytext);BEGIN(asm);}
<asm>"\nend" {linenumber++;printf("\nend");BEGIN(INITIAL);} 
<asm>"\n" {linenumber++;printf("\n");}
<asm>[^\n]+ {printf("%s", yytext);} 


"_sdata"            printf("%s", yytext);  
"sdata" {printf("%s",yytext);BEGIN(sdata);}
<sdata>"=" printf(" %s ", yytext);  
<sdata>[ \t]+ putchar(' ');
<sdata>"\n"[ \t]*"end" {linenumber++;printf("\nend");BEGIN(INITIAL);}
<sdata>"\n" {linenumber++;printf("\n");}
<sdata>[^\n=]+ {printf("%s", yytext);} 


"_data"            printf("%s", yytext);  
"data" {printf("%s",yytext);BEGIN(data);}
<data>"\n"[ \t]*"end" {linenumber++;printf("\nend");BEGIN(INITIAL);}
<data>"\n" {linenumber++;printf("\n");}
<data>[^\n]+ {printf("%s", yytext);} 


"alphachars" {printf("%s",yytext);BEGIN(alphachars);}
<alphachars>[^\n]* { printf("%s", yytext); } 
<alphachars>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

"memset" {printf("%s",yytext);BEGIN(domemset);}
<domemset>[^\n]* { printf("%s", yytext); } 
<domemset>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

"alphadata" {printf("%s",yytext);BEGIN(alphadata);}
<alphadata>"\n"[ \t]*"end" {linenumber++;printf("\nend");BEGIN(INITIAL);}
<alphadata>"\n" {linenumber++;printf("\n");}
<alphadata>[^\n]+ {printf("%s", yytext);} 


"_speechdata"            printf("%s", yytext);  
"speechdata" {printf("%s",yytext);BEGIN(speechdata);}
<speechdata>['] {printf("%s",yytext);BEGIN(speechquotestart);}
<speechdata>"\n"[ \t]*"end" {linenumber++;printf("\nend");BEGIN(INITIAL);}
<speechdata>[ \t]+ putchar(' ');
<speechdata>[ \t\r]+$ 
<speechdata>"\n" {linenumber++;printf("\n");}
<speechdata>[^'\n]+ {printf("%s", yytext);} 


<speechquotestart>[ \t] putchar('^');
<speechquotestart>['] {printf("%s",yytext);BEGIN(speechdata);}
<speechquotestart>[^'\n]+ {printf("%s",yytext);} 
<speechquotestart>\n {fprintf(stderr, "(%d) Warning: Unterminated speech quote.\n", linenumber); linenumber++; printf("\n"); BEGIN(speechdata);} 


"_songdata"            printf("%s", yytext);  
"songdata" {printf("%s",yytext);BEGIN(songdata);}
<songdata>['] {printf("%s",yytext);BEGIN(songquotestart);}
<songdata>"\n"[ \t]*"end" {linenumber++;printf("\nend");BEGIN(INITIAL);}
<songdata>[ \t]+ putchar(' ');
<songdata>[ \t\r]+$
<songdata>"\n" {linenumber++;printf("\n");}
<songdata>[^'\n]+ {printf("%s", yytext);}


<songquotestart>[ \t] putchar('^');
<songquotestart>['] {printf("%s",yytext);BEGIN(songdata);}
<songquotestart>[^'\n]+ {printf("%s",yytext);}
<songquotestart>\n {fprintf(stderr, "(%d) Warning: Unterminated song quote.\n", linenumber); linenumber++; printf("\n"); BEGIN(songdata);}

  /*
"plotchars" {printf("%s",yytext);BEGIN(plotchars);}
<plotchars>['] {printf("%s",yytext);BEGIN(plotquotestart);}
<plotchars>[ \t]+ putchar(' ');
<plotchars>[ \t\r]+$
<plotchars>\n {linenumber++;printf("\n");BEGIN(INITIAL);}
<plotchars>[^'\n]+ {printf("%s", yytext);}
 */

"plotchars" {printf("%s",yytext);BEGIN(plotchars);}
<plotchars>['] {printf("%s",yytext);BEGIN(plotquotestart);}
<plotchars>[ \t]+ putchar(' ');
<plotchars>[ \t\r]+$
<plotchars>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

 /*
<plotquotestart>[ \t] putchar('^');
<plotquotestart>['] {printf("%s",yytext);BEGIN(INITIAL);} 
<plotquotestart>[^'\n]+ {printf("%s",yytext);}
<plotquotestart>\n {fprintf(stderr, "(%d) Warning: Unterminated plotchars quote.\n", linenumber); linenumber++; printf("\n"); BEGIN(INITIAL);}
 */

<plotquotestart>[ \t] putchar('^');
<plotquotestart>['] {printf("%s",yytext);BEGIN(INITIAL);}
<plotquotestart>^\n* printf("%s",yytext);



"strcpy" {printf("%s",yytext);BEGIN(strcpy);}
<strcpy>['] {printf("%s",yytext);BEGIN(plotquotestart);} 
<strcpy>[ \t]+ putchar(' ');
<strcpy>[ \t\r]+$
<strcpy>\n {linenumber++;printf("\n");BEGIN(INITIAL);}
<strcpy>[^'\n]+ {printf("%s", yytext);}


"_include"            printf("%s", yytext);  
"include" {printf("%s",yytext);BEGIN(includes);}
<includes>[^\n]* {printf("%s",yytext);}
<includes>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

"incgraphic" {printf("%s",yytext);BEGIN(incgraphic);}
<incgraphic>[^\n]* {printf("%s",yytext);}
<incgraphic>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

"incbanner" {printf("%s",yytext);BEGIN(incbanner);}
<incbanner>[^\n]* {printf("%s",yytext);}
<incbanner>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

"incmapfile" {printf("%s",yytext);BEGIN(incmapfile);}
<incmapfile>[^\n]* {printf("%s",yytext);}
<incmapfile>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

"inccompress" {printf("%s",yytext);BEGIN(inccompress);}
<inccompress>[^\n]* {printf("%s",yytext);}
<inccompress>\n {linenumber++;printf("\n");BEGIN(INITIAL);}


"plotmapfile" {printf("%s",yytext);BEGIN(plotmapfile);}
<plotmapfile>[^\n]* {printf("%s",yytext);}
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
<backup>[^\n']* {printf("%s",yytext);}
<backup>\n {linenumber++;printf("\n");BEGIN(INITIAL);}

<backupquotestart>[ \t] putchar('^');
<backupquotestart>['] {printf("%s",yytext);BEGIN(set);} 
<backupquotestart>[^'\n]+ {printf("%s",yytext);}
<backupquotestart>\n {fprintf(stderr, "(%d) Warning: Unterminated backup quote.\n", linenumber); linenumber++; printf("\n"); BEGIN(set);}


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
[ \t]*=[ \t]*   printf(" = ");  
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

int yywrap(void) {
    if (include_stack_ptr > 0) {
        FILE* finished_file = yyin; // Keep track of the FILE* to close it

        // Delete the buffer associated with the file we are done with
        yy_delete_buffer(YY_CURRENT_BUFFER); // Use YY_CURRENT_BUFFER to refer to the current buffer

        include_stack_ptr--; // Pop from stack
        
        // Restore the previous buffer state from our stack
        yy_switch_to_buffer(include_stack[include_stack_ptr]); 
        
        // Restore the previous input source (FILE*) for Flex's internal use
        yyin = file_stack[include_stack_ptr]; 

        // Close the file pointer of the file we just finished, if it's not stdin
        if (finished_file != stdin && finished_file != NULL) { 
            fclose(finished_file);
        }

	printf(" incbasicend\n");
        
        return 0; // Signal to Flex: "more input is available from the new (old) buffer"
    }
    // We are at EOF of the main file (or no includes were active)
    return 1; // Signal to Flex: "no more input"
}
  
extern int yy_flex_debug; // For debugging, consider removing or guarding for final version

// Main function to drive the lexer
int main(int argc, char **argv){
    // yy_flex_debug = 1; // Uncomment to enable Flex's own debug output
    
    FILE *initial_file_ptr = stdin; // Default to stdin

    if (argc > 1) {
        initial_file_ptr = fopen(argv[1], "r");
        if (!initial_file_ptr) {
            perror(argv[1]); // Print system error message
            return 1;
        }
        yyin = initial_file_ptr;
    } else {
        yyin = stdin; // Explicitly set to stdin if no arguments
    }

    yylex(); // Start lexical analysis

    // After yylex completes (either normally or via exit()),
    // yyin will point to the last active file stream.
    // If it was the initial file opened by main, close it.
    // Included files are closed by yywrap.
    if (initial_file_ptr != stdin && initial_file_ptr != NULL) {
        fclose(initial_file_ptr);
    }
    
    // Defensive cleanup: if yylex exited abnormally leaving files on stack
    // (though exit() in rules should be avoided for graceful cleanup)
    while(include_stack_ptr > 0) {
        include_stack_ptr--;
        if (file_stack[include_stack_ptr] != stdin && file_stack[include_stack_ptr] != NULL) {
            // Note: We can't safely call yy_delete_buffer here if yylex didn't finish normally
            // for this buffer. Just closing the FILE* is the main concern.
            fprintf(stderr, "Warning: Force closing file from include stack due to abnormal exit.\n");
            fclose(file_stack[include_stack_ptr]);
        }
    }

    return 0;
}
