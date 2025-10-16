
 rem ** include_01.bas file info
 rem ** we do some trivial stuff and include another file

 dim bar=q
 dim foo=r
 bar = foo + 1

 incbasic include_02.bas 

 bar = foo - 1
 incbasic include_02.bas 
