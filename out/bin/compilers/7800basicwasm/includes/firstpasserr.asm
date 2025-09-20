
 ; throw a compile
 ifconst RMT
  ifnconst pokeysupport
    echo
    echo "************************************************************"
    echo "*** ABORT: RMT Tracker requires 'set pokeysupport $xxxx' ***"
    echo "************************************************************"
    ERR ; abort
  endif ; pokeysupport
  ifnconst pokeyaddress
    echo
    echo "************************************************************"
    echo "*** ABORT: RMT Tracker requires 'set pokeysupport $xxxx' ***"
    echo "************************************************************"
    ERR ; abort
  endif ; pokeyaddress
 endif
    
