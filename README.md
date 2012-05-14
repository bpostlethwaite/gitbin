# gitbin

NOT FUNCTIONAL STILL IN DEVELOPMENT

gitbin collects scattered dotfiles (or other files) into a central directory for usage with git. It uses the same command-line syntax as git for ease of use and replicates much of the same basic functionality. 

[![Build Status](https://secure.travis-ci.org/Postlethwaite/gitbin.png?branch=test)](http://travis-ci.org/Postlethwaite/gitbin)


## How to Install
```bash
not yet installable from npm
```
Download file into a directory on your node path

## How to use

### Initialize a directory
To begin using gitbin you must initialize a bin (directory) to be used as the local repository for your files. This adds the bin into the global gitbin register `.globalstate.json`

```bash
gitbin init
```

### Add file to bin and track file
To add a file to bin head to the directory containing the file and run `add` command. This both copies the file to the current bin as well as adding the file to the bin local registry `.trackedfiles.json`.
```bash
gitbin add <file1> <file2> ...
```

### Remove tracking from file
To stop tracking a file, meaning the file will not be part of any `push` or `pull` commands use the `remove` command. Note that this will not actually delete the file from the bin directory. This should be done with the unix `rm` command. 
```bash
gitbin rm <file1> <file2> ...
```

### List bins
*gitbin* allows usage of more than one bin. If you have initialized more than one bin (directory) you can list the bins gitbin is linked to (in the `.globalstate.json`) with:
```bash
gitbin bin
```

### Delete bin
To remove a bin from being tracked by *gitbin* do:
```bash
gitbin bin -d <bin>
```
Deleting a bin will only remove it from the `.globalstate.json` file preventing *gitbin* from accessing this bin. The `.trackedfiles.json` is not unlinked from the directory so using the `init` command will both restore the bin and the files previously tracked. To seriously delete a bin, deleting it from *gitbin* statefiles and unlinking it via unix commands are necessary.

### Checkout bin
To change the _active_ bin which *gitbin* points to for it's other commands use:
```bash
gitbin checkout <bin>
```
where `<bin>` is the name of the bin as listed by the `node gitbin bin` command.

### Push changes to bin
Once files have are being tracked by *gitbin* and changes to those files are made in the original file locations on the filesystem running the `push` command copies those files and replaces the files in the bin with the newer versions. *Git* can then be used to version and add to a repository.
```bash
gitbin push
```
Note: as protection against accidentally pushing to the wrong bin, the push command will yeild a warning announcing the current bin the push will be performed on and waiting user input.

### Pull changes from bin to filesystem
This may or may not be implemented as it has the potential for grief. However, on a new machine it would be nice to pull from github then push to the filesystem. Perhaps file by file input regarding file replacement and path creation would mitigate potential information loss. An `-f` force switch could turn this caution feature off.
```bash
gitbin pull
```

### Check status
This borrows that most handy git feature and lists all bins registered as well as marking the bin currently in use (the _active_ bin) and the files registered to that bin. 
```bash
gitbin status
```



#### Stuff to do:
- make it so users can not `add` files in a bin directory
- `status` should check time stamps for useful info
- make sure arguements go in as array
