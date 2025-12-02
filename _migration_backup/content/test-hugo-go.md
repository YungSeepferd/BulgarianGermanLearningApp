---
title: "Hugo/Go Optimization Test"
date: 2024-01-01
draft: true
---

This page demonstrates the new server-side rendering capabilities that replace JavaScript functionality.

## 1. Server-Side Vocabulary Cards

Individual vocabulary card using Hugo shortcode:

{{< vocab-card word="Здравей" translation="Hallo" level="A1" category="Begrüßung" difficulty="1" frequency="95" notes="Standard informal greeting used throughout the day in Bulgaria" >}}

## 2. Vocabulary Grid with Filtering

Server-rendered vocabulary grid with minimal JavaScript:

{{< vocab-grid category="Begrüßung" level="A1" limit="10" showFilters="true" >}}

## 3. Enhanced Search

Server-side search with Hugo data templates:

{{< vocab-search >}}

## Performance Benefits

- **Faster Initial Load**: Server-side rendering eliminates JavaScript processing time
- **Better SEO**: Search engines can index the vocabulary content
- **Reduced JavaScript**: From 23 JS files to minimal client-side code
- **Improved Accessibility**: Works without JavaScript enabled

## Go Backend Features

The new Go backend API provides:

- **Spaced Repetition**: SM-2 algorithm implementation
- **Progress Tracking**: User statistics and performance metrics
- **RESTful API**: Clean endpoints for vocabulary management
- **Data Processing**: CLI tools for vocabulary optimization

## Technical Implementation

- **Hugo Shortcodes**: Replace JavaScript card rendering
- **Hugo Taxonomies**: Server-side filtering and categorization  
- **Go API**: Backend services for spaced repetition
- **Go CLI Tools**: Data processing and validation
- **Static Generation**: Pre-rendered content for better performance
