## Let's build XigmaNas from source!

What could go wrong?

I am a total FreeBSD noob and a terrible <s>C/Python</s> programmer. But I love me some [XigmaNas](https://www.xigmanas.com/).  I really like the "firmware" model, it bootstraps itself up into a RAM disk and the original boot files and OS are never accessible, so in theory can't get corrupted.  I've been running it at home for years, I forget how many, maybe 10 years?  And it is rock solid.

> XigmaNAS is an Open Source Storage NAS (Network-Attached Storage) distribution based on FreeBSD.

> Navidrome is a self-hosted, open source music server and streamer.

## What are you doing!?

Building an OS from source can be a little daunting.

Which release of XigmaNas are you trying to build?  Why are you doing this?

Maybe you don't need to do this at all? Maybe bhyve or a vm can do it for you?

For stability reasons I suggest to NOT use the Xigmanas trunk, but [the last stable release](https://sourceforge.net/p/xigmanas/code/HEAD/tree/branches/14.3.0.5/). Just based on the vibes. And my pain.

Today (Oct 2026) that is 14.3.0.5

But hey, go for it.


> You need to get your ducks in a row.
> 
> The Xigma release will reference a FreeBSD release, e.g. for XigmaNas-14.3 this is FreeBSD `releng/14.3`
> 
> You need the ports branch to match the FreeBSD branch.

**releng** - "release engineering branch", a little FreeBSDism.

This guide is to help me bake in the realtek-re-kmod drivers for the RTL8125 chipset, used in my cheap TPLink 2.5Gbe card.

And to add [Navidrome](https://www.navidrome.org/) as a service.

The XigmaNas releases are not exactly reproducible builds.  If you are expert at FreeBSD, ports and make then you will probably have a better time than I did.

The more I learn the more I see that this is not a XigmaNas issue, but more a FreeBSD issue.  

The main issue is building the ports.  Due to many dependencies, transitive dependencies, missing libraries, changes between versions of FreeBSD we find DEPENDENCY HELL. Ooooo.  Go search for "freebsd cython conflict". It seems FreeBSD has been a bit laissez faire in dependency management between, or even within, versions...

## Orientation

I am operating on this repository - https://svn.code.sf.net/p/xigmanas/code/branches/14.3.0.5/

In the `/build` folder we find the main `make.sh` which delegates pretty much everything to `functions.inc`.

Within `functions.inc` I found it helpful to find the menu item in the build I was having trouble with and follow the code from there, usually through a `choice`.  

The `/ports` directory is important.  Here we find all the `Makefile`s for each port, and also a `/distfiles` folder that has some "special" dependencies.  Notice also the `/ports/Makefile` here.

The `/kernel-config` folder holds a `modules.files` file, which shows the kernel drivers being used.

## Branches, tags, ports and kernel

It took many attempts to find this.  This is NOT the right branch for the ports, but I'm pretty sure there is no right branch.  This branch produced the least errors.

**Important - much pain if the branches don't line up**

> FreeBSD: releng/14.3 (https://git.freebsd.org/src.git)  
> (Commit: 833d39bd2e38421a14ea489a956261a0fa993fbc)
> 
> Xigmanas: 14.3.0.5 (https://svn.code.sf.net/p/xigmanas/code/branches/14.3.0.5/)  
> (Revision: 10655) 
> 
> Ports: 14.2-eol (https://cgit.freebsd.org/ports/tree/databases?h=14.2-eol)  
> (Commit: 4e450f33b9f9cf668688f9c439c58871751e2bbb)


## Fix the ports

With `14.2-eol` I had three failures, which can be resolved:

**php84-APCu**

`/usr/local/xigmanas/svn/build/ports/php84-APCu/Makefile`

Can be fixed by updating the Makefile to be like the one from trunk - remove lang/php84 dependency.

```
BUILD_DEPENDS=	${NONEXISTENT}:devel/pecl-APCu \
		php84:lang/php84
```

Replace with: `BUILD_DEPENDS=	${NONEXISTENT}:devel/pecl-APCu`

**samba422**

Note: we do this before `make.sh` is run.

samba422 - cython conflict - removing cython3 fixed it.

I cannot figure out what causes this.

Removing `cython3` removes the conflict.

`pkg-static delete -f py311-cython3`

We will need to run this before we run `make.sh`
  
**vbox**

vbox seems to be hitting swap issues! 

The error message suggests to add to Makefile `/usr/ports/emulators/virtualbox-ose-72/Makefile` in /usr/ports - `MAKE_JOBS_UNSAFE=yes` which limits make to single thread. :(

We can set in `make.conf` instead and scope it to the "problem areas".  Yes, Claude told me this.
 
```
.if ${.CURDIR:M*/devel/llvm19}
MAKE_JOBS_NUMBER=4
.endif
```

**python311**

Probably related to cython? Who knows.

The shipped Makefile for the XigmaNas version of python311 expects the /usr/ports/ version of python311 to have been built.

This error turns up while installing ports, so very late in the game.

```
cd /usr/ports/lang/python311
make stage
```

This seems very odd, the XIgamNas version seems to just want to install the host python311?

I do not understand what I am looking at. 

This line in the Makefile seems... wrong?

`DEP_STAGEDIR=	${PORTSDIR}/lang/python311/work/stage`


## Realtek driver

The realtek card I care about uses chipset RTL8125.  The realtek drivers (re) shipped by FreeBSD DO NOT support this at this time.  Or in v15 either.

Hence we build the `ports/net/realtek-re-kmod` port and install.

## Create QEMU FreeBSD

https://download.freebsd.org/ftp/releases/amd64/amd64/ISO-IMAGES/14.3/

Use the `FreeBSD-14.3-RELEASE-amd64-disc1.iso.`

Time has moved on and 14.3 is no longer hosted there (14.4+ as of right now).  You may need to shop around.

## Make the FreeBSD build VM

Create a FreeBSD 14.3 build machine.  I have allocated 16GB RAM and 140GB drive space.  You might get away with less RAM.  The build takes hours, so give it what you can.  I did find I ran out of diskspace at 100GB... so 140GB is good.

```
#!/bin/bash

# this a build machine, need CPU
# 140GB HDD, 16GB RAM and 8 cores 
qemu-img create -f qcow2 freebsd-img.qcow2 140G

# ssh port 22 is forwarded to 2222
qemu-system-x86_64 -cdrom ../FreeBSD-14.3-RELEASE-amd64-disc1.iso -cpu host -enable-kvm -m 16384 -smp 8 -drive file=./freebsd-img.qcow2,format=qcow2 -net nic -net user,hostfwd=tcp::2222-:22 
```

Had to install qemu-system-x86_64 on my host, but all good.

## Installing FreeBSD

Pretty much just accept all defaults.

Install with lib32, **NOTE: not the lib32-dbg**

No point installing ports or src as these are pulled later via git.

Used Auto UFS/GPT and the whole disk.  The XigmaNas dev guide suggests two partitions, a 4GB `swap` and a larger `/`. I just took the defaults, which was a 4GB `swap`. 

Enter new root password.  It rhymes with groot.

Accept all defaults for ipv4 and ipv6.

Set timezone and region.

Do not add any users we will run as root.

And reboot.

## Prepare the VM - enable ssh

Enable SSH on the VM: 

```
# run this on the VM
pkg install -y nano git subversion

# uncomment this in /etc/ssh/ssh_config
# PasswordAuthentication yes
nano /etc/ssh/ssh_config

# enable this in /etc/ssh/sshd_config
# PermitRootLogin yes
nano /etc/ssh/sshd_config

service sshd restart

mkdir /usr/local/xigmanas

# used later for sshfs
mkdir ~/xigma
```

## SSH to the VM

Can get the ip address locally via `ifconfig` and look for the virtbr virtual bridge, this time it's `192.168.122.1`.

`ssh root@192.168.122.1 -p2222`

You may need to remove the old key if this is not your first attempt.  Read the error message.

## Add ssh-fs fileshare

You can do this later if you want. Assuming this build actually works we want to be able to copy the disk image back to our desktop.

On the VM I made this directory in my (root) home `~/xigma`.  And you should already have this directory `/usr/local/xigmanas` in the VM.

`sshfs -o port=2222 root@192.168.122.1:/usr/local/xigmanas ~/xigma`

## The XigmaNas Readme - hmmmm...

Follow the readme at `https://sourceforge.net/p/xigmanas/code/HEAD/tree/branches/14.3.0.5/build/README` but it's misleading.

It's pretty much correct, just any mention of ports, or pulling the ports has to be taken with a large chunk of salt.

Primarily it does not specify where the ports come from, which leads to much cursing.

We pull the BSD source and ports ourselves.

## Prepare the build environment

Update `/etc/make.conf`

Read the file in the source for the latest.

```
OPTIONS_UNSET=X11
DEFAULT_VERSIONS+=mysql=8.0
DEFAULT_VERSIONS+=ssl=base
DEFAULT_VERSIONS+=php=8.4

# due to 14.3 being so "old", i mean it's been over a year...
ALLOW_UNSUPPORTED_SYSTEM=yes
# oh my
DISABLE_VULNERABILITIES=yes

# vbox build blows up the swap
.if ${.CURDIR:M*/devel/llvm19}
MAKE_JOBS_NUMBER=4
.endif
```

## Get the "right" ports

Now get the ports up to date with dependancies.

```
# update the ports tree
rm -rf /usr/ports
git clone --depth 1 --branch 14.2-eol https://git.FreeBSD.org/ports.git /usr/ports

# pull the src - note: releng/14.3 - or do this later via the build menu
# although with --depth 1 this way is faster ~350MB vs ~1.8GB
rm -rf /usr/src
git clone --depth 1 -b releng/14.3 https://git.freebsd.org/src.git /usr/src

# Pull the source for XigmaNas 14.3.0.5
cd /usr/local/xigmanas && svn co https://svn.code.sf.net/p/xigmanas/code/branches/14.3.0.5/ svn 
```

We want all packages built from the same sources to avoid any weird dependancy issues. Ha!

## Edit the php84-APCu Makefile

`/usr/local/xigmanas/svn/build/ports/php84-APCu/Makefile`

Can be fixed by updating the Makefile to be like the one from trunk - remove lang/php84 dependency.

```
BUILD_DEPENDS=	${NONEXISTENT}:devel/pecl-APCu \
		php84:lang/php84
```

Replace with: `BUILD_DEPENDS=	${NONEXISTENT}:devel/pecl-APCu`

## Adding the navidrome port

While we still have nano available, and before running the `make.sh`.

```
cp -R /usr/ports/multimedia/navidrome/ /usr/local/xigmanas/svn/build/ports/navidrome
echo "ON" > /usr/local/xigmanas/svn/build/ports/navidrome/pkg-state
```

Update the `/usr/local/xigmanas/svn/build/ports/Makefile` and add:

```
    SUBDIR += navidrome
```

Update the Navidrome `/usr/local/xigmanas/svn/build/ports/navidrome/Makefile`

Add:

```
# add this near the top somewhere, or we get a lot interactive prompts
BATCH=yes

# add this after the post-install: target
post-stage:
	@${MKDIR} ${XIGMANAS_ROOTFS}${PREFIX}/bin ${XIGMANAS_ROOTFS}${PREFIX}/etc/rc.d ${XIGMANAS_ROOTFS}${PREFIX}/etc/navidrome
	@${INSTALL_PROGRAM} -v ${STAGEDIR}${PREFIX}/bin/navidrome ${XIGMANAS_ROOTFS}${PREFIX}/bin
	@${INSTALL_SCRIPT} -v ${STAGEDIR}${PREFIX}/etc/rc.d/navidrome ${XIGMANAS_ROOTFS}${PREFIX}/etc/rc.d
	@${INSTALL_DATA} -v ${STAGEDIR}${PREFIX}/etc/navidrome/config.toml.sample ${XIGMANAS_ROOTFS}${PREFIX}/etc/navidrome

```

## Adding the realtek port 

We will build the port, but later we will **NOT** install it.  The install goes to the `modules` folder instead of ports.

```
cp -R /usr/ports/net/realtek-re-kmod/ /usr/local/xigmanas/svn/build/ports/realtek-re-kmod
echo "ON" > /usr/local/xigmanas/svn/build/ports/realtek-re-kmod/pkg-state
```

Update the `/usr/local/xigmanas/svn/build/ports/Makefile` and add:

```
    SUBDIR += realtek-re-kmod
```

## Making the memory disk bigger

After including Navidrome the image exceeds the size of the memory disk.  We need to extend that for the creation of the LiveCD ISO and for the actual memory disk when xigmanas is running.

> The two files (`rc` and `functions.inc`) MUST agree on the memory disk size - in this case 1600MB

Edit the `/usr/local/xigmanas/svn/etc/rc` file:

Replace:

```
# Fixed values requested by build/make.sh
MDLOCALSIZE=1332m
SWAPSIZE=512m
```

With:

```
# Fixed values requested by build/make.sh
MDLOCALSIZE=1600m
SWAPSIZE=512m

```

Edit the `/usr/local/xigmanas/svn/build/functions.inc` file.

Note the `XIGMANAS_MDLOCAL_SIZE` variable.

Replace:

```
#	Size in MB of the MFS Root filesystem that will include all FreeBSD binary
#	and XigmaNAS® WebGUI/Scripts. Keep this file very small! This file is unzipped
#	to a RAM disk at XigmaNAS® startup.
#	The image must fit on 2GB CF/USB.
#	Actual size of MDLOCAL is defined in /etc/rc line 38.
XIGMANAS_MFSROOT_SIZE=132
XIGMANAS_MDLOCAL_SIZE=1192
XIGMANAS_MDLOCAL_MINI_SIZE=36
#	Now image size is less than 500MB (up to 476MiB - alignment)
XIGMANAS_IMG_SIZE=460
if [ "amd64" = ${XIGMANAS_ARCH} ]; then
	XIGMANAS_MFSROOT_SIZE=144
	XIGMANAS_MDLOCAL_SIZE=1332
	XIGMANAS_MDLOCAL_MINI_SIZE=52
	XIGMANAS_IMG_SIZE=500
fi
```

With:

```
#       Size in MB of the MFS Root filesystem that will include all FreeBSD binary
#       and XigmaNAS® WebGUI/Scripts. Keep this file very small! This file is unzipped
#       to a RAM disk at XigmaNAS® startup.
#       The image must fit on 2GB CF/USB.
#       Actual size of MDLOCAL is defined in /etc/rc line 38.
XIGMANAS_MFSROOT_SIZE=132
XIGMANAS_MDLOCAL_SIZE=1600
XIGMANAS_MDLOCAL_MINI_SIZE=36
#       Now image size is less than 500MB (up to 476MiB - alignment)
XIGMANAS_IMG_SIZE=460
if [ "amd64" = ${XIGMANAS_ARCH} ]; then
        XIGMANAS_MFSROOT_SIZE=144
        XIGMANAS_MDLOCAL_SIZE=1600
        XIGMANAS_MDLOCAL_MINI_SIZE=52
        XIGMANAS_IMG_SIZE=500
fi
```

## Build some prerequisites

```
# removes the pkg we installed - git, subversion, nano and a few other things
pkg delete -y -f \*
cd /usr/ports/shells/bash && make BATCH=yes install clean

cd /usr/ports/ports-mgmt/portupgrade && make BATCH=yes install clean

cd /usr/ports/sysutils/cdrtools && make BATCH=yes install clean

cd /usr/ports/devel/subversion && make BATCH=yes install clean

cd /usr/ports/devel/git && make BATCH=yes install clean

# to fix problem with installing ports
cd /usr/ports/lang/python311 && make BATCH=yes stage
```

## Build XigmaNas - run the make file

Remove the `cython` problem and run `make.sh`.

```
pkg-static delete -y -f py311-cython3

/usr/local/xigmanas/svn/build/make.sh
```

And it begins...

```
-------------------------------------------------------------
		Build Environment XigmaNAS® 
-------------------------------------------------------------
Choice Menu:

1) - Update XIGMANAS_SVNDIR to latest XigmaNAS Source Files.
2) - Enter Compile Menu.

-------------------------------------------------------------
Generate Images:
10) - Create 'Embedded.img.xz' File.         (Firmware Update)
11) - Create 'LiveUSB.img.gz MBR' File.   (Rawrite to USB Key)
12) - Create 'LiveUSB.img.gz GPT' File.   (Rawrite to USB Key)
13) - Create 'LiveCD' (ISO) File.
14) - Create 'LiveCD-Tin' (ISO) Without 'Embedded' File.
15) - Create 'Full' (TGZ) Update File.
16) - Create All Release images at once.
-------------------------------------------------------------
17) - Create translations xigmanas.pot file from Source files.

*)  - Exit.
```

1 - We can skip. it just pulls the "https://svn.code.sf.net/p/xigmanas/code/trunk" again.  Useful if you maintained this build machine.

2 - We **MUST** run this. Must.

### 2 - Compile Menu

```
-------------------------------------------------------------
		Build Environment XigmaNAS®                  
-------------------------------------------------------------
Compile Menu:

1) - Update FreeBSD Source Tree and Ports Collections.
2) - Create Filesystem Structure.
3) - Build/Install the Kernel.
4) - Build World.
5) - Import base-ports to their locations.
6) - Build Ports.
7) - Build Bootloader.
8) - Add Necessary Libraries.
9) - Modify File Permissions.
-------------------------------------------------------------

*) - Exit Compile Menu.
```

**2.1 Update FreeBSD Source Tree and Ports Collections.**

- 1. Pull FreeBSD src source tree - this is a clone, deletes the `/usr/src` directory and clones
- 2. Update FreeBSD src source tree - is a pull
- 3. Fetch and install binary updates - updates this vm install
- 4. Update ports collection - does a git pull on the /usr/ports
- 5. Upgrade pkg on host - like an apt update/upgrade on this vm

If you already pulled the FreeBSD source then you can skip this whole menu item.

If not - Run 1. That is all.

**2.2 - Create Filesystem Structure.**

Yes - run this.  Sets things up in `/usr/local/xigmanas/rootfs`

**2.3 - Build/Install the Kernel.**

1. Apply kernel patches
2. Build kernel
3. Install kernel + modules

Run all of these.  You can select all three at once.

The install kernel + modules step is the bit we need to copy later to install the realtek driver.

**2.4 - Build World.**

Yes - run this. Copies a bunch files around.

**2.5 - Import base-ports to their locations.**

Yes - run this.  Updates some of the `/usr/ports/distfiles` with build specific things.

**2.6 - Build Ports.**

- 1. Build ports
- 2. Build ports (dev only, no preselection)
- 3. Re-build ports (dev only)
- 4. Install ports

Run 1 & 4.

When we run 4 **deselect the realtek-re-mod** port.

> Rerunning the "Install" step is very brittle. You MUST rebuild or `make clean` the port before trying to reinstall.

This takes ages. Like, 8 hours. And sometimes has a dialog you have to hit enter on. Although that might have been Navidrome.  Hopefully the `make.conf` settings have shut it all up.

You should see navidrome in the list.  And realtek-re-kmod too. Cool.

![Insert SpongeBob Time Card meme here.](assets/time-passes.jpg)  

> At this point we can stop and exit the `make.sh`
>
> We need to get the realtek module in place.

### Adding the realtek-re-kmod

We should have built the driver now.  We can install it into the image we are creating.

Check the path below is correct, the `if_re.ko` file was in a folder `rtl_bsd_drv-ea4ed1e` whcih apparently is the git hash, so the folder might be different.

```
install -v -o root -g wheel -m 555 \
    /usr/local/xigmanas/svn/build/ports/realtek-re-kmod/work/*/if_re.ko \
    /usr/local/xigmanas/rootfs/boot/modules
```

> And now - back to `/usr/local/xigmanas/svn/build/make.sh`.
>
> Select 2 and then 7 to continue below.

**2.7 - Build Bootloader.**

Yes - run this.

**2.8 - Add Necessary Libraries.**

Just run the first option - "Add required libraries".  Becuase they are required. Duh.

**2.9 - Modify File Permissions.**

Just run it.

## Carry on building

I create the following images, for testing and the real installation:

```
12) - Create 'LiveUSB.img.gz GPT' File.   (Rawrite to USB Key)
13) - Create 'LiveCD' (ISO) File.
```

Oh, we done!

## Write the image

OK... how do I get it off the VM?

Earlier we made this directory in the home (root) folder on the VM `~/xigma`

Mount this via sshfs.

`sshfs -o port=2222 root@192.168.122.1:/usr/local/xigmanas ~/xigma`

We should find 

- XigmaNAS-x64-LiveCD-14.3.0.5.10655.iso
- XigmaNAS-x64-LiveUSB-GPT-14.3.0.5.10655.img.gz

We can mount the LiveCD ISO on another QEMU VM and test.

```
qemu-img create -f qcow2 xigmatest.qcow2 40G

# start with live cd
qemu-system-x86_64 -cpu host -enable-kvm -m 8192 -smp 4 \
  -cdrom ./XigmaNAS-x64-LiveCD-14.3.0.5.10655.iso \
  -drive file=./xigmatest.qcow2,format=qcow2 \
  -net nic -net user,hostfwd=tcp::2224-:22,hostfwd=tcp::8080-:80

# after installing, eject the cd, expose navidrome port 
qemu-system-x86_64 -cpu host -enable-kvm -m 8192 -smp 4 \
  -drive file=./xigmatest.qcow2,format=qcow2 \
  -net nic -net user,hostfwd=tcp::2224-:22,hostfwd=tcp::8080-:80,hostfwd=tcp::4533-:4533
```

You can install Xigmanas to this VM, configure the NIC's and DHCP.  After install, shutdown the VM and restart **without** the CD.

You should get an IP like `10.0.2.15`.  I can access the web gui via `http://localhost:8080`, enable ssh. And all good.

**Test realtek-re-kmod as best we can**

Does the module exist?

`ls -l /boot/modules/if_re.ko`

Can we load the module - should get no errors.

`kldload /boot/modules/if_re.ko`

This VM does not have the hardware, so the rest of the config can happen later.

**Test Navidrome**

Copy the sample config:

```
cp /usr/local/etc/navidrome/config.toml.sample /usr/local/etc/navidrome/config.toml
service navidrome onestart
```

And hit it on `http://localhost:4533`.  

Great. More config is needed, but that can happen on the real thing. Or practice here.

## Install Xigmanas on your NAS

Backup your config.

Install xigmanas.

Restore config.

## Configure realtek-re-kmod driver to load.

Log in to the default on the working nic so we can set up the boot loader.

Via the web gui:

**Navigate to System>Advanced>loader.conf**

Add two entries:

```
if_re_load="YES"
if_re_name="/boot/modules/if_re.ko"
```

These end up in the `config.xml` file as:

```
<loaderconf>
	...
	<param>
		<uuid>deadbeef-dead-c0de-face-8badcafef00d</uuid>
		<enable type="bool">1</enable>
		<name>if_re_load</name>
		<value>YES</value>
		<comment/>
	</param>
	<param>
		<uuid>deadbeef-dead-c0de-face-8badcafef00d</uuid>
		<enable type="bool">1</enable>
		<name>if_re_name</name>
		<value>/boot/modules/if_re.ko</value>
		<comment/>
	</param>
```

**Navigate to System>Advanced>Command Scripts**

In theory we should not need to do the following. In practice we do.  I do not know why.

Add new preinit script with the command `kldload if_re`

Reboot.

Should now be able to configure the NIC to the realtek one.

## Configure Navidrome

Read the navidrome freebsd config setup guide.

We need somewhere to store Navidrome's metadata. I made a new partition on my boot drive, but it could just be a folder on some disk.

I made `/mnt/navidrome-data` and mounted via the web gui so it is persistant.

We need a bunch of `rc.conf`.  Navidrome will respect these settings over the `config.toml`.

```
	<name>navidrome_enable</name>
	<value>YES</value>

	<name>navidrome_datafolder</name>
	<value>/mnt/navidrome-data</value>

	<name>navidrome_config</name>
	<value>/mnt/navidrome-data/config.toml</value>
```

Edit the `config.toml`

Comment the ipaddress out so it responds on all nics and uncomment the port.

Via ssh to Xigmanas set:

`chown -R www:www /mnt/navidrome-data`

And reboot.

We can now hit the navidrome gui at http://192.168.1.xxx:4533





