## check vfio-pci in use

`lspci -v | grep -A 10 " NVIDIA "`

## unbind the "wrong" driver

```
sudo modprobe vfio-pci
echo 0000:01:00.2 | sudo tee /sys/bus/pci/devices/0000:01:00.2/driver/unbind
echo 10de 1ad8 | sudo tee /sys/bus/pci/drivers/vfio-pci/new_id
```

# setup

## set intel

`sudo prime-select intel`

## purge drivers

`sudo apt-get purge '*nvidia*'`

## blacklist nouveau

`sudo nano /etc/modprobe.d/blacklist-nouveau.conf`

```
blacklist nouveau
blacklist lbm-nouveau
options nouveau modeset=0
alias nouveau off
alias lbm-nouveau of
```

Then update:

```
sudo update-initramfs -u

reboot
```

## GRUB

`sudo nano /etc/default/grub`

```
# enable
GRUB_CMDLINE_LINUX_DEFAULT="nouveau.modeset=0 intel_iommu=on iommu=pt vfio-pci.ids=10de:1e81,10de:10f8,10de:1ad8,10de:1ad9"
# disable
#GRUB_CMDLINE_LINUX_DEFAULT=""
```

Then update: 

```
sudo grub-mkconfig -o /boot/grub/grub.cfg
sudo reboot now
```

## initramfs

`sudo nano /etc/initramfs-tools/modules`

```
# add these
vfio
vfio_iommu_type1
vfio_pci
vfio_virqfd
vhost-net
```

Then update:

```
sudo update-initramfs -u

reboot
```


# teardown

i will leave a few things, e.g. bios, the vfio modules

`sudo nano /etc/default/grub`

```
# disable
# GRUB_CMDLINE_LINUX_DEFAULT="nouveau.modeset=0 intel_iommu=on iommu=pt vfio-pci.ids=10de:1e81,10de:10f8,10de:1ad8,10de:1ad9"
# enable
GRUB_CMDLINE_LINUX_DEFAULT=""
```

```
sudo apt install nvidia-driver-580 -y
sudo prime-select nvidia
sudo grub-mkconfig -o /boot/grub/grub.cfg
sudo reboot now
```

and don't forget to plugin HDMI...

# turn back on

`sudo nano /etc/default/grub`

```
# enable
GRUB_CMDLINE_LINUX_DEFAULT="nouveau.modeset=0 intel_iommu=on iommu=pt vfio-pci.ids=10de:1e81,10de:10f8,10de:1ad8,10de:1ad9"
# disable
#GRUB_CMDLINE_LINUX_DEFAULT=""
```

```
sudo apt purge '*nvidia*' -y
sudo prime-select intel
sudo grub-mkconfig -o /boot/grub/grub.cfg
sudo reboot now
```

and don't forget to plugin HDMI...

## unbind wrong driver

```
sudo modprobe vfio-pci
echo 0000:01:00.2 | sudo tee /sys/bus/pci/devices/0000:01:00.2/driver/unbind
echo 10de 1ad8 | sudo tee /sys/bus/pci/drivers/vfio-pci/new_id
```