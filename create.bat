@echo off
mode con: cols=150
:: npm install
echo .
echo Creating discord-free-storage!
echo This time with no viruses either!! :P
echo .

echo Creating /data/
IF NOT EXIST "./data/" mkdir "./data/" 

cd data
IF NOT EXIST "files.json" echo []> files.json
echo Created data/files.json
cd ..

echo Creating /downloads/
IF NOT EXIST "./downloads/" mkdir "./downloads/" 

echo Creating /temp/
IF NOT EXIST "./temp/" mkdir "./temp/" 

echo Creating /uploading/
IF NOT EXIST "./uploading/" mkdir "./uploading/" 

echo Creating /.env
IF NOT EXIST ".env" (
    echo discordToken = "" > .env
    echo discordChannel = "" >> .env
    echo .env file created with placeholder values
)

echo xxxxxxxxxxxdxxxxxxkkkkkkxxxxxxxxxxxxxdddddddddddooooooooooooooooodkkkkkOkkkkkocckXXK0Okxxxxxxxxxxxkkkxdxxxxxxxxxxxxxxxxxkkkkkkxxxxxxdl',:c:cc::::::::;
echo dxxxxxxxxxxxxxxxxxxkkkkkkxxxxxxxxxxxxxddddddddddddddddddddddooooodkOkkkkkkkkkkdc;o0XK0OkxkkkkkOOOOOOkxxxxxxxxxxxxxxxkkkkkkkkkkxxxxxxd:';cccc::::::;',l
echo xxxxxxxxxxxxxxxkkkkkOkkkkxxxxxxxxxxxxxxxxdddddddddddddddddddddddoxkOkkkkkkkkkkOd;':xK0OOkOOOOO00OO0Okxxxxxxxxxxxxkkkkkkkkkkkkkkkkxxdc,;ccc::;:;;,'..:k
echo ,:lodxxxxxxxxxkkkkkkOOkkkkxkkkxxxxxxxxxxxxdddddddddddddddddddddddxOOkkkOOOOOOOOxoc',oOOOOOOOO000000Okxxxxxxxxxkkkkkkkkkkkkkkkkkkxxdoc:clc:::cc:;'..'ox
echo ...',,;okkkkxxxkkkkkkOkkOkkkkkkkkxxxxxxxxxxxxddddddddddddddddddddxOOkkOOOOOOO0OxxOd;'ckOOOO00000000Okxxxxxkkkkkkkkkkkkkkkkkkkkkkxxdl;:c:;;;;;;;,'..',,
echo .......lxkkkkkkkkkkkkkkxkkkkkkkkkkxxxxxxxxxxxddddddddddddddddddddxOOOkO0000000Oxk00Olcx0O0000000KKKOxxkkdoodkkkkkkkkkkkkkkkkkkkkxdl,'::'..............
echo .......;dxxxkkkkkkkkkOxoxOkkkkkkkkkkxxxxxxxxddddddooddddxxxxxxxxxxkOOOO0000000OxOKKKOk00000KK0KKKKKxldxxc,,lkkkkkkkkkkkkkkkkkkxxxd:..,;'..............
echo ...';...:xkkkkkkkkkkkOOodOkkkkkkkkkkxxxxxxxxddollllodxddxxxxxxxxxkkkOO0000000KOxOXXKOOK00KKKKKKKKK0l;;cloooxxooolokkkkkkkkkkkkxxxl,.',;;::::::::::::;;
echo ....lo'..;dkkkkkkkkkkOOkxOOkkkkkkxdxkxxddooollol;,cooodddxxxxxxxxkOOOO00K00KKKOxOKKKOO0O0KKKKKKKKKd'...,lddxocclclxkkkkkkkkkkkxxxo;,:::::cccccc:;;cl;'
echo ....'ddc'';okkkkOOOOOOOOOOOkkkkkkxc;ldolc::;,;lxocll::dxxxxxxxxxxO00OO0KKKKKKKOx0KK0O0000KKXKKKK0l'..;:lodddooddolokOkkkkkkkkkxkkd:,;;:cccc::::,';ll,,
echo ......:dxl:;:okkOOOOOOOOOOOOkOOOkkd;.,cc:;;,;clolclc:lxkxxxxxxxxkO00000KKKKKKKOkKKK0k0K00KKXXXKk:...,ldxxxkkkxxkkddkkkkkkkkkkxxkxc....,cccc::;;,,cl:,:
echo ...'. .;kOkxdoxOOOOOOOOOOOOOOOOOkkxl,..';clllddddoddxxxkkxxxxxxxxkO00000KKKXKKOOKKKOk0K000KXXOl'....cxOOOOOOOOOOOkkkkkkkkkkkkxkkl'....',,,'....',ll;;c
echo ...''...oOOOOOOOOOO000OOOO0OOOOOOkxoc,...':oxkkkxxxOOOkkxdxddollccloddlclclooodkOxddx0000KKOl,......:loddddddoxOkxkkkkkkkkkkxxxxc.............'':o:,:;
echo ;.......:kOOOOOOOOO000000O00OOOOOkkdoc'.....,:odxxdxxocc;;;:;,''...''''''..''',;;,'',coxxdc'.......,::ccccc:;:dOxdkOOkkkkkkkxxoc,...............''....
echo ,.......'cxkOOOOO00000000O00OO0OOkkxdl;........,;:::;,,'''''''.........................''.........';:ccllclc;ckOdxkOOOOkkkkxxo;'.......'',,,,''''..'''
echo ...........;okOOOOOO000000O0000OOkkxdlc,..........''''............................................,:;;;:ccoocoOkdxkkkOOOkkkkxl,'''''',;:cclllc:::::::c
echo .............ck0OO00000000000OOOOOkxddoc;........................................................';;,,,;;cdooxOd:lxOOOOkkkkkxl,'',;;;;,,;;;;;;;;;::cll
echo .'..''...','';x000000000K0000OOOOOOkkkdl:,.......................................................',;;;;;;;::cdOl..'cdkOkkkkkx:'';coc;'.,c;,;;',clooooo
echo '''.''....''',lO0O000000KK0000O00OOOOkdlc;.......................................................,coolllllcccxk:.....;okkkkxl,.'',;:;,:c:,'',,:ccloll:
echo ''''','....''':x000000000K00K00KKOO0K0koc;...........   .........................................,lddoolcccclOOl'......cxkxd:''..',,,:ol;'..,:clooooc;
echo ,'''''.....''';oO00000000K0O000KK0O0KKOxl,.............   .......................................':oollllllldOkllc.....'lxdl,''.',,,';cllc;.',:ccc;'..
echo :,,,'.......',,ckOOOOOO0000xk0O0K00KKK0xc'.....;:,,'................................'......''.....,cloolllllx0xldo'....;odo:.''''....'''''''';;:;'''..
echo l;,,,'......',,:oxxxxxxkkO0kkOO00OO0KKOl,......:;.........,'.....................''.'....'.,;......'cxOkxddxOOdlxdccclx00xc'..........,,,,,,;;;:;::;'.
echo dc,,,,'......,,;lkOOOOOOOOOOOOO0Oxkkkkd,.......,:'.......;:'.....................','.......;:.......,cdkkkOO0kodkkxO0KXKko;.'.........,,'.';;;;,:c:;'.
echo do;..........',,:xOOOOOOOOOOOkOOOOkkOd;'........':;'''';cc;'......................',,....';:'........,lxxxdxOkoxOkO0KXXOd:'...............;:;,..':;,''
echo ddc'..........,,,lddoolllllloxxxkkxkkl,'..........',,,;;'...........................'''',,'..........'lxxxxkOdokOO0KKKKxl,...............;c:,...,;''''
echo dxd:,,,,,,....,cloxxxdddddddxkkkkkkkdc'''................................'''.........................':lollkOddkOO0000Oo:'.............':c;,,,',;,,,''
echo ddxo;,,,,,'...,oddk0KKXXXXXXKK0000KK0o,''............................''..'''..........................;cc:lkkoxOOO000Oxc,............,;;,'..:llllc:;,,
echo ddddc'''..'...'clco0KKXXXXXKK0OOO00KKk:''.................................''..........................cxkxxkxdxkkO00OOdc;''.,;;,,,,,,''....,ldxxxkkxdo
echo OOkkx,........'cc:lOXXXXXXXXKK0000KKKOl,'.........................'.......''.........................'ck000000OOOkkkkkkxxxddddoooool:;,',,;oxxxxxxxxxx
echo 00000o'...........;xXXXXXXXXXXXXKKK0Ox:'..................... ..',''.................................':xO00000000O0OOOOkOOkkkkkkkkxl:;,':oxkkkOOOkkkxx
echo kkkkkxc,''''',;cldkKXXKKK0000OOOOkkkkd:'....................  .......................................':xO0KK000000000OOOOOOOOOkxxxo:;;,;ldollooddddooo
echo ''''',,;:clodxk000OOOkkkkkkkkkkkkkkkkd:'..................................     .......................ck0KKK00000K00OOOOOOOOOOOkxo:;;,::cllcccccccccc:
echo cccloodxxkkkkxxxxxxxxxxxkkkkkkkkkkkxdo:........................... ......     ........................ck0KKKKK00K00000000OOOOOOOkl::;cl;colccccccccc:;
echo kxxxdddddddddddddxxxxxxkkkkxxxkkdoolcc;..............................................................'lO0KKKKKKKK0000000000OOOOOxc:;:l:;colccccccc:::;
echo oooooodddddddddddxxxxxxxoc;;,;:ccodxdoc;.............................. .......  .....................;d000KKKKKKKKK0000000OO00OOdc;;:c;:llccccccc:::;:
echo oooooooodddddddddolclloxd,.......'cdkxdl,........................       ......  .............  ......:x0KKKKKKKKKKKK00000OOOOOOdc::::;;cllcccccc:::;';
echo ooooooooooooolc:,...':cokx:.......'cdxdc,.........................      .............................:k0KKKKKKKKKK0KK00K000000Okxdoc:;clllccccc:::;'':
echo oollooooooddo;.......':cokx;......,clol;................................................        .....;dO0KKKKK00KK0KKKKKKK0KKK0O000kkxolllcccc:::clcco
echo llooodddddoddo:;;;,,'';ccoOklclcccllolc,...          ............  ...................              .,oO00000KK00KKKKKKKKK000000K0OOkxollcccc:::codddd
echo ooooddddddddddddxddolloolldkOOOkkkkkkdc'.               ........   ..........   .                   .;d0000OO00000KK00000000000000OOkdlllccc::::ldddoo
echo oooodddddddddddddoolllllcclllcllodxxkxl'.                    ...............                       ..:x0KK00000O00KK000OOOOOOO0OOOOkxollccc::::codxxdd
echo ooddddoloolooollccccllclloolcllc:::;::;...                       ......                           ..,d00000KKK0OO000000000OOkOOOOkkOOxxdollcc::coddxxx
echo ollooollllccc:::ccccccloooooooooloollc;'..                                                      ....'lO0OO000O0OOOO000O000OOOOOOOOkOOOOkkxxxdooooodddd
echo lcclccccc:::::;;;;::::cccclodoooddoooc,....                                                    .....'ckOkO000OOOOOOOOOOO0OOkkkkkkkxxkkOkxxxxxxxdooddoo
echo ccc::::::;;;;,;;;;;;;:cc::cllllooloooc,.......                                                 ......:xOOOO00000000OkkOOkkkOkkkkkxkkkkOOkkkkkxxddooooo
echo c:;;;;;;;,;;;,,;;;;;;;;:::ccclccccoolc,..........             ...............                 .......,oOOkO00O0OO0OOOOO0OOkkkkkOOkkkkkOOkxxxxxdddxxddo
echo ;,,,,;;;;;;;;;;;;;;;;;;;:::ccccccllccc;,'...........       .......','......... .           ..........':xOOO00O000000OkkOOkOOkdxkkkxxxkkkkxxxxddddxxxxd
echo ;;;;,,;;;;;;;;;;;:::::::::::ccccclooolc:,.......................',::,''...............  ..............,oO0OOOO00OOOOOkOkxkkxkxxxxxxkxxdxxxkkxxdooddxdd
echo :;;::;;;,',;;;;:;,,;::::::::cccclllooll:,'......................'''''.................................'lkOOOkkOOOOOkkOOkxxxxxxxxxkxkkkxxxkkxdxdddxkOkx
echo ;;;;;;;;,',;;;;::;:;;:::cccc::cclllllllc;'.....................''.....................................'lxkOkxxxxxxxxxxxxxxxxdxxddkkkkOkkkkxddddxkOkkkk
echo ,,,;;;;;,,::;;,,;;::;;;;::::::clllcccllc,.............................................................,lxkkkxxxxxdodxxxxxxxxdxxxdxxdxxkxdxxxdoodxxxxxx
echo ,,;;,,;,,,:;;:;,,;::;;::;::::c::::clllc;'.............................................................'lxkxxkkxxxxxxkxxxxxxxdxxxxdddxxxxxxdddolc::cllo
echo ;;;;,,,,,,,;;:::;;:;,;:::;,;:c::ccclccc;'..............   ..............  ...... .....    ............'cdxxxxkxxdxxxxxddxxxooodddddddxxdddddddool:;,;:
echo ,,,;;,,,,,,;;;::;,;::;;;::;;cc::::cc:cc;'................. .....................  ...     .............cxkxxxdxddooxxdoooddoolodooddddddloooddooool:,'
echo ',,,,,',,;:;';:::;,,:::ccc::::::;;::cc:,...............................................................;oxxxxdddxxdxxddooddooodxxxxdoooddddoodooodoll;
echo ',,,,',;,,,;:::;;;,,:::::;:::cc:;:::cc:'...............................................................,ldddxddoodddxxxdoololoodxddddooddodddddllllllc
echo ;;;;,,;;;,;,;;;,,,,,;;;;::::;;::::cc::,................................................................'cdxxxdoloddxxddoodxxoooooddddoooooddooollooool
echo ;;;;;;;:;;;;,,,'',;,,,''',;,,;:cll::c;.................................................................,coodooddolodxdoddoddoooooolloooolollooooolodol
echo ;::::;,,'';:;,,,;;;;;,'',,,;:ccclllll,.................................................................,loddooodooooodddolodooolodollolc:cooolllolcllc
echo ;;,,;;;;,';:;,,;;,,;;;;,,,;;::::colcc,.................................................................;oooddolooodooddollooollolloollcccclollooolclcc
echo ;;,',;;,,,;:;,,;,';:::;;;;'.;:;:clc;:;.................................................................;oddddolllloodxxdoooolllol:clcccclolc:ldoccllc:
pause
