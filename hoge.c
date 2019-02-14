#include <stdio.h>
#include <stdlib.h>
#define F char *f

main() {
  F = "zsh: そのようなファイルやディレクトリはありません: ./a.out";
  printf /* | egrep -v ".*" #*/ (""); /*
    F=$( echo $F | egrep -o "[A-Za-z]*" | sed "s/ //g" )
    gcc $0 -o $F && ./$F || for i in 1 ; do echo lol; # */
  printf /*$F? | sed "s/\/\*\([A-Za-z]\)/\1/g" ; echo #*/ ("%s\n", f);
  return 0;
  printf /* >/dev/null # */ ("");  //\
  done;
}
//usr/bin/env false #\
main