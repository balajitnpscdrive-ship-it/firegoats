Deployment Guide: GitHub Pages + Firebase
This application is ready to be hosted on GitHub Pages with Firebase as the backend.

1. Firebase Setup
Go to Firebase Console.
Create a new project named College House System.
Add a Web App to the project.
Copy the firebaseConfig object and paste it into 

firebase-config.js
.
Enable Cloud Firestore in test mode (or setup rules).
Enable Cloud Storage if you want to upload logos.
2. GitHub Deployment
Create a new repository on GitHub.
Initialize and push these files to the main branch:
bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
Go to Repository Settings > Pages.
Select Deploy from a branch and choose main / (root).
Your app will be live at https://YOUR_USERNAME.github.io/YOUR_REPO/.
3. Real-time Features
Once Firebase is configured, the TV Dashboard will update automatically as soon as any teacher awards points on their device.
Multiple teachers can log in and award points simultaneously.
