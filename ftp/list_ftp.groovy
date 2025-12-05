import org.apache.commons.net.ftp.FTPClient

def host = args[0]
def username = args[1]
def pass = args[2]
def remoteDir = args[3]
def filename = args[4]

def ftp = new FTPClient()
ftp.connect(host, 21)
ftp.login(username, pass)

ftp.enterLocalPassiveMode()

def files = ftp.listNames(remoteDir)
log.info("names:" + ftp.listNames())

if (!files.contains(filename)) {
  prev.setSuccessful(false)
}

ftp.logout()
ftp.disconnect()