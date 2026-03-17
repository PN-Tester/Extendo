# Extendo - Attack Surface Expansion Tool
The purpose of this tool is to make quick determination of available web app attack surfaces convenient for casual browsing.
No more commandline tools and subsequent trial and error. While this tool is only relevant for web application attack surface,
it aims to offer a fast, convenient and hassle free approach for testers performing casual estimations and recon.

NEW IN VERSION 3 :
- User defines valid response codes
- Granular control of what subdomains are opened
- Improved UI!
![](https://github.com/PN-Tester/Extendo/blob/main/Extendo_demo.gif)


# Usage
In 1 click, you get all the available subdomains associated with your target. The tool will validate HTTP response codes
for each enumerated subdomain, keeping only the type that the user selected (default 200, 301, 302). After enumeration, the extension will display a list of results and allow the user to open all desired subdomains in new tabs.
Extendo uses the SecurityTrails API and so it requires that you add your free API key to the background.js file at the designated position.
Simply open the extension on your target page, and click the launch button. After loading phase, tabs will open automatically.

# Installation
1. git clone https://github.com/PN-Tester/Extendo/
2. Edit the background.js file and add your own securityTrails API key at the designated position
3. In chromium based browser (chrome, edge, opera, etc) navigate to chrome://extensions
4. Set the "Developer mode" switch to Enabled
5. Select "Load unpacked" button which appears
6. Select the Extendo folder and hit enter
7. Restart the browser


