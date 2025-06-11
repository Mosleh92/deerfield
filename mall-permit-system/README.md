# Mall Permit Management System

A comprehensive permit-to-work management system for shopping malls with multi-department workflows, automated shop account creation, and advanced document management.

## Features

### Core Functionality
- **Multi-Department Access**: Operations, Technical, Security, and Tenant roles
- **Automated Shop Account Creation**: Generate email/password combinations automatically
- **Advanced Permit System**: Three-tier work classification (Light/Medium/Heavy)
- **Document Management**: Upload and track worker documents, insurance certificates
- **Multi-Stage Approval**: Technical → Security → Management workflow
- **Memo/Notification System**: Mass communication capabilities
- **QR Code Generation**: For approved permits
- **Form Correction**: Operations can edit submitted forms

### Technical Features
- **Netlify Deployment Ready**: Optimized for Netlify hosting
- **Serverless Architecture**: Using Netlify Functions
- **Database Integration**: FaunaDB for data persistence
- **File Storage**: Netlify Large Media integration
- **Authentication**: Netlify Identity with role-based access
- **Internationalization**: Arabic/English support with RTL
- **Responsive Design**: Mobile-first approach

### Department-Specific Panels
- **Operations Management**: User creation, shop management, system oversight
- **Technical Department**: Review maintenance and development permits
- **Security Department**: Safety inspections, worker document verification
- **Tenant Dashboard**: Submit permit requests, track status

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mall-permit-system