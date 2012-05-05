# dotjs

Dot.js collects scattered dotfiles (or other files) into a central directory for usage with git. It uses the same command-line syntax as git for ease of use and replicates much of the same basic functionality. 


## How to Install
```bash
not yet installable from npm
```
Download file into a directory on your node path

## How to use

### Initialize a directory
To begin using dot.js you must initialize a bin (directory) to be used as the local repository for your files. This adds the bin into the global dot.js register (.dotglobal.json)

```bash
node dot.js init
```

### Add file to bin
To add a file to bin head to the directory containing the file and run this command. This both copies the file to the current bin as well as adding the file to the bin local registry (.dotlocal.json).
```bash
node dot.js add <file1> <file2> ...
```

### List bins
Dot.js allows usage of more than one bin. If you have initialized more than one bin (directory) you can list the bins dot.js is linked to (in the .dotglobal.json) with:
```bash
node dot.js bin
```

### Checkout bin
To switch between different bins so that added files are moved to the appropriate bin you would use:
```bash
node dot.js checkout <bin>
```
where <bin> is the name of the bin as listed by the `node dot.js bin` command.

### Push changes to bin
This would not be a useful tool unless it saved you time. Once you have added files to a bin and then made changes to those files in their original locations on the filesystem running the `push` command copies those files and replaces the files in the bin with the newer versions. Git can then be used to version and add to a repository.
```bash
node dot.js push
```
Note: as protection against accidentally pushing to the wrong bin, the push command will yeild a warning announcing the current bin the push will be performed on and waiting user input.

### Pull changes from bin to filesystem
This may or may not be implemented as it has the potential for grief. However, on a new machine it would be nice to pull from github then push to the filesystem. Perhaps file by file input regarding file replacement and path creation would mitigate potential information loss. An `-f` force switch could turn this caution feature off.
```bash
node dot.js pull
```

<<<<<<< HEAD
### Check status
This borrows that most handy git feature and lists all bins registered as well as marking the bin currently in use and the files registered to that bin. It ensures that the `.dotlocal.json` is in sync with the actual files in the bin.
```bash
node dot.js status
```
=======
### Check dot.js status
This borrows that most handy git feature and lists all bins registered as well as marking the bin currently in use and the files registered to that bin. It ensures that the `.dotlocal.json` is in sync with the actual files in the bin.

>>>>>>> 6dcc86138b19ba3ec5bb1ae7b79aafaab7b99a14

