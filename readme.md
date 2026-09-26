<div align="center">
  <img src="public/logo/eBookShala_Logo.svg" alt="eBookShala Logo" width="72" />
  <h1>eBookShala</h1>
  <p><strong>A Modern, Editorial Digital Library & Personal Reading Sanctuary</strong></p>

  <p>
    <a href="https://ebookshala.onrender.com" target="_blank">
      <img src="https://img.shields.io/badge/Live_Website-ebookshala.onrender.com-783535?style=for-the-badge&logo=render&logoColor=white" alt="Live Website" />
    </a>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
  </p>
</div>

---

## Overview

**eBookShala** is a full-stack digital library web application built for readers. Designed with a warm, editorial aesthetic (`#F8F5E9` cream paper tones and classic serif typography), eBookShala enables users to discover thousands of classic volumes, read books directly in the browser, engage in real-time book discussions, and curate their personal library shelves.

**Live Production Website:** [https://ebookshala.onrender.com](https://ebookshala.onrender.com)

---

## Key Features

* **Extensive Digital Catalog:** Browse and search thousands of books powered by the **Open Library API** and **Project Gutenberg**, complete with caching for trending titles and **48+ categorized genre filters**.
* **Instant Search & Filtering:** Expandable navigation search bar and real-time shelf filtering by title, author, or genre.
* **Secure Authentication:** Full support for **Local Authentication** (Email & Password) and **Google OAuth 2.0** via Passport.js, with protected access for reading full books and posting comments.
* **Personal Reader Profile:**
  * Automatically tracks **Recent Reads** as books are opened.
  * Curates personal collections under **My Bookmarks** and **Liked Books**.
  * Supports custom display names, profile avatars, and classic book-cloth banner themes.
* **Real-Time Community Discussions:** Leave book reviews and comments with live updates powered by **Socket.io**.
* **Literary Reflections:** Dynamic literary quote banner welcoming logged-in readers with classic quotes from world literature.

---

## Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | EJS (Embedded JavaScript Templates), CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM, `connect-mongo` |
| **Authentication** | Passport.js (`passport-local`, `passport-google-oauth20`), `express-session` |
| **Real-Time** | Socket.io |
| **External APIs** | Open Library API, AllOrigins CORS Proxy |
| **Deployment** | Render |

---

## Project Structure

```text
eBook/
├── config/             # Passport.js authentication strategies (Local & Google OAuth)
├── controllers/        # Route controllers for books, catalog, comments, and user actions
├── middleware/         # Custom authentication middleware for protected routes
├── models/             # Mongoose schemas (User & Book models)
├── public/             # Static assets (eBookShala_Logo.svg, uploads, client resources)
├── views/              # EJS templates
│   ├── partials/       # Reusable UI components (navBar.ejs, footer, etc.)
│   ├── index.ejs       # Landing page with trending books, stats, and literary quotes
│   ├── catalog.ejs     # Searchable catalog with 48+ genre filters
│   ├── bookDetails.ejs # Book reader, metadata, and real-time comments
│   └── profile.ejs     # Personal library shelves & profile customization
├── server.js           # Express & Socket.io server entry point
└── package.json        # Project dependencies and scripts
```

---

## Branching & Deployment Workflow

* **`main` branch:** Production-ready code automatically deployed to [https://ebookshala.onrender.com](https://ebookshala.onrender.com).
* **`test` branch:** Staging branch for developing and testing new UI updates and features before merging into `main`.

---

## Author

**Varsha Jangid**
* GitHub: [@varshajangid07](https://github.com/varshajangid07)
* Live Website: [https://ebookshala.onrender.com](https://ebookshala.onrender.com)