run:
	clj -J-XstartOnFirstThread -M -m kosmos.main

nrepl:
	clj -J-XstartOnFirstThread -A:nrepl -m nrepl.cmdline