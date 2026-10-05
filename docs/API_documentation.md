# My eBookShala Project Documentation

## About the Project

This project is a full-stack web application built with Node.js, Express, and MongoDB. It allows users to create accounts, log in securely, and browse a large catalog of books. I also included a live socket connection so users can join specific book rooms. Since I do not have a personal database of thousands of books, I connected the application to the free Open Library API to fetch real book data.

## The Open Library API

For this project, I use the Open Library API to provide all the book content. Open Library is a massive, free online catalog of books. Instead of manually typing out and storing thousands of book records in my own database, my server simply requests the data it needs directly from Open Library. Whenever a user browses the site or searches for a book, the API automatically sends back the matching book titles, authors, and cover images for my application to display.

## API Integration Overview

My `server.js` file acts as a middleman between the user's browser and the Open Library database. Below is a simple explanation of how my server handles this data.

### 1. Home Page (Trending Books)

The home page automatically loads 5 trending fiction books.

* **Caching:** To make the home page load fast and avoid hitting the API too many times, my server remembers these 5 books for exactly one hour. If a user visits the site within that hour, they get the saved books.
* **Fallback:** If the Open Library API goes down, my site won't crash. It will just show the last saved list of books.

### 2. Catalog Page (Search and Browse)

The catalog page allows users to find specific books. It displays up to 24 books at a time.

* **Search:** If a user types in a keyword, the server sends a search request to the API.
* **Categories:** If a user clicks a category (like Mystery or Romance), the server asks the API for top books in that specific subject.

### 3. Data Cleaning

Real-world API data is often messy or incomplete. Depending on how you search, the Open Library API sends back data in different formats.

To fix this, I wrote code that takes the messy data and turns it into a clean, standard format before sending it to the user's screen. My code also handles missing information:

* If the API forgets to send a title or author, my server replaces it with "Unknown Title" or "Unknown Author".
* If a book does not have a cover picture, my server automatically inserts a default "No Cover" placeholder image.

This ensures the website always looks clean and never crashes due to missing data.