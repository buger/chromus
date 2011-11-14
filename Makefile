build:
	rm -f ext.zip | find . -type d -name .git -prune -o -type f -not \( -name "*.coffee" -o -name "*.less" -o -name "*.sublime*" -o -name ".gitignore" -o -name "*.zip" -o -name "Makefile" \) -print | zip -q ext -@
	
