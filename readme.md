# Extendo - Attack Surface Expansion Tool
The purpose of this tool is to make quick determination of available web app attack surfaces convenient for casual browsing.
No more commandline tools and subsequent trial and error. While this tool is only relevant for web application attack surface,
it aims to offer a fast, convenient and hassle free approach for testers performing casual estimations and recon.

NEW IN VERSION 3 :
- User defines valid response codes
- Granular control of what subdomains are opened
- Improved UI!

# Demo
![](https://github.com/PN-Tester/Extendo/blob/main/Extendo_demo.gif)


# Usage
With 1 click, the tool will fetch historical DNS records and attempt to return all active subdomains of your target. 
The tool will validate connectivity to each enumerated subdomain, and return a filtered list of live hosts based on the user selected HTTP response codes.
After enumeration, the extension will display the list of results and allow the user to select which subdomains to open. Selected subdomains will open silmultaneously in new tabs.
Extendo uses the SecurityTrails API and requires that you add your free API key to the service-worker.js file at the designated position.
Simply open the extension on your target page, and click the launch button. After loading phase, tabs will open automatically.

# Installation
1. git clone https://github.com/PN-Tester/Extendo/
2. Edit the background.js file and add your own securityTrails API key at the designated position
3. In chromium based browser (chrome, edge, opera, etc) navigate to chrome://extensions
4. Set the "Developer mode" switch to Enabled
5. Select "Load unpacked" button which appears
6. Select the Extendo folder and hit enter
7. Restart the browser


