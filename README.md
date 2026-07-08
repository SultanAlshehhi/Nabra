# Nabra - AI-Powered Speech Therapy Platform

<p align="center">
  <img src="attached_assets/Nabra_github.png" alt="Nabra Logo" width="500">
</p>

## 🎯 Project Overview

Nabra is an innovative AI-powered speech therapy platform designed to help patients improve their speech through intelligent analysis, gamified feedback, and professional reporting. The platform serves both patients and speech therapists with tailored interfaces and comprehensive tools.

Dataset: https://www.seeingspeech.ac.uk/speechstar/multimedia-speech-databases/

## ✨ Key Features

### 🎤 **Speech Analysis & Recording**
- **Real-time Voice Recording**: Easy-to-use recording interface with guided practice sessions
- **AI-Powered Analysis**: Advanced speech analysis using cutting-edge AI technology
- **Phonetic Transcription**: Detailed phonetic analysis with IPA symbols and error identification
- **Interactive Feedback**: Visual feedback showing correct and incorrect pronunciations

### 📊 **Comprehensive Reporting**
- **Detailed PDF Reports**: Professional reports with transcript analysis and recommendations
- **Error Pattern Analysis**: Identification of specific speech patterns and difficulties
- **Progress Tracking**: Session history and improvement metrics
- **Medical Recommendations**: Appointment-specific next steps and treatment plans

### 🏥 **Appointment Management**
- **Doctor Selection**: Choose from speech therapists, ENT specialists, and pediatric specialists
- **Scheduling System**: Book appointments with date, time, and doctor selection
- **Appointment Tracking**: View upcoming appointments in patient dashboard
- **Therapist Portal**: Complete appointment management system for healthcare providers

### 👥 **Multi-Role Access**
- **Patient Portal**: Personalized dashboard with session history and progress tracking
- **Therapist Portal**: Professional interface for managing patients and appointments
- **Role-Based Features**: Tailored functionality for different user types

## 🛠️ Technology Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Wouter** for routing
- **Lucide React** for icons

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SultanAlshehhi/Nabra.git
   cd Nabra
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000` to view the application

## 📱 Usage

### For Patients
1. **Register/Login** as a patient
2. **Start a Session** from the dashboard
3. **Record Speech** following guided prompts
4. **View Results** with detailed phonetic analysis
5. **Book Appointments** with recommended specialists
6. **Track Progress** through session history

### For Therapists
1. **Login** to the therapist portal
2. **Manage Patients** and view their progress
3. **Review Appointments** and confirm schedules
4. **Access Reports** for clinical documentation
5. **Monitor Progress** across multiple patients

## Licensing

This repository uses separate licenses for code and non-code materials:

- Source code, scripts, configuration, and other software files are licensed
  under the MIT License.
- Non-code assets, documentation, notebooks, datasets, model artifacts,
  generated media, and supporting materials are licensed under the Creative
  Commons Attribution 4.0 International License (CC BY 4.0).
- Third-party dependencies, vendored packages, and files with their own license
  notices remain under their original license terms.

See [LICENSE](LICENSE) for the full licensing details.

## 🏗️ Project Structure

```
Nabra/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Backend Express server
├── shared/                # Shared types and schemas
├── attached_assets/       # Images and static assets
└── docs/                  # Documentation
```


**Nabra** - Making speech therapy accessible, engaging, and effective through AI technology. 🎤✨
