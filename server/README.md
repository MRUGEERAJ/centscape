# Centscape Backend

AI-powered URL preview extraction service built with **TypeScript** and **Node.js** that uses OpenAI Vision API to extract comprehensive product information from any URL.

## Features

- 🤖 **AI-Powered Extraction**: Uses OpenAI GPT-4 Vision API for intelligent content analysis
- ⚡ **Fast Performance**: Optimized for sub-15 second response times
- 🔒 **Security**: Built-in SSRF protection and input validation
- 🌐 **Universal**: Works with any website (Amazon, Flipkart, etc.)
- 📸 **Screenshot Analysis**: Takes full-page screenshots for accurate data extraction

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Add your OpenAI API key to .env
   ```

3. **Build TypeScript**:
   ```bash
   npm run build
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Development mode** (with auto-reload):
   ```bash
   npm run dev
   ```

6. **Test the API**:
   ```bash
   curl -X POST http://localhost:3000/api/preview \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.flipkart.com/product-url"}'
   ```

## API Endpoints

- `POST /api/preview` - Extract product information from URL
- `GET /api/health` - Health check
- `GET /` - API information

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `PORT` - Server port (default: 3000)

## Response Format

```json
{
  "success": true,
  "data": {
    "title": "Product Title",
    "image": "Image URL",
    "images": ["Image URLs"],
    "price": "Price",
    "currency": "Currency",
    "originalPrice": "Original Price",
    "discount": "Discount",
    "siteName": "Website Name",
    "description": "Description",
    "category": "Category",
    "brand": "Brand",
    "rating": "Rating",
    "reviewCount": "Review Count",
    "availability": "Stock Status",
    "features": ["Features"],
    "offers": ["Offers"],
    "contentType": "Content Type"
  },
  "metadata": {
    "extractionMethod": "fast_ai",
    "confidence": 0.9,
    "processingTime": 1234567890,
    "aiUsed": true,
    "fieldsExtracted": 17,
    "url": "Source URL",
    "timestamp": "2025-09-05T03:30:00.000Z"
  }
}
```

## Technology Stack

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **OpenAI API** - AI-powered content analysis
- **Puppeteer** - Screenshot capture
- **Axios** - HTTP client
- **Cheerio** - HTML parsing

## License

MIT