# Extendo - Attack Surface Expansion Tool

# Rational
The purpose of this tool is to make casual determination of available web app attack surfaces convenient for casual browsing.
No more commandline tools and subsequent trial and error. While this tool is only relevant for web application attack surface,
it aims to offer a fast, convenient and hassle free approach for testers performing casual estimations and testings.

# Usage
In 1 click, you get all available subdomains hosting web apps opened in your browser as separate tabs. The tool will validate HTTP response codes
for each enumerated subdomain prior to opening them, excluding any error responses and opening only responses with 200 or redirect codes.
Extendo uses the SecurityTrails API and so it requires that you add your free API key to the background.js file at the designated position.
Simply open the extension on your target page, and click the launch button. After loading phase, tabs will open automatically

# Installation
