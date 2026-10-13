# Recover password on a VM. 

Recover password on a VM. Or any machine you have physical access to.

Oh I forgot my password.  Not sure what happened really, copied the VM and now I cannot login.

Beware if you have EFS or encrypted files.  You will probably have a bad time.

## Create a WinPE ISO

Install the [ADK](https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/download-winpe--windows-pe), run Deployment tool as admin then run

<pre><code>
 copype amd64 C:\WinPE_amd64
 MakeWinPEMedia /ISO C:\WinPE_amd64 C:\WinPE_amd64\WinPE_amd64.iso
</code></pre>

## Mount that ISO as a CD/DVD

Something something VM settings.

## Force the VM to boot from CD

Edit the [.vmx of your VM](https://kb.vmware.com/s/article/1004129) and add

<pre><code>
 bios.forceSetupOnce = "TRUE"
</code></pre>

Now the fun.  I found my VM drive, D:

## Hijack a system utility

<pre><code>
D:
cd D:\windows\system32
ren utilman.exe utilman.exe.old
copy cmd.exe utilman.exe
</code></pre>

## Reboot.

At the password prompt open the accessibilty tools, that little icon at the bottom.

<pre><code>
 whoami
</code></pre>

I am [system](https://msdn.microsoft.com/en-us/library/windows/desktop/ms684190(v=vs.85).aspx). That's handy.

## Update password

<pre><code>
 net user Administrator Password123
</code></pre>

## And login.

Voila.

