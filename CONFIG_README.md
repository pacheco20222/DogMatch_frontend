# DogMatch Frontend Configuration

## Quick Setup

1. **Copy the example config:**
   ```bash
   cp config.example.js config.js
   ```

2. **Update the URLs in `config.js`:**
   ```javascript
   const config = {
     API_URL: 'http://YOUR_LOCAL_IP:5002',      // Your computer's IP
     SOCKET_URL: 'http://YOUR_LOCAL_IP:5002',   // Same as API_URL
     ENV: 'development',
     isDevelopment: true,
     isProduction: false,
   };
   ```

## Finding Your Local IP

### On Mac/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### On Windows:
```bash
ipconfig | findstr "IPv4"
```

### Or check your backend logs:
When you run the backend, it will show:
```
* Running on http://YOUR_IP:5002
```

## Configuration Options

- **API_URL**: Backend REST API endpoint
- **SOCKET_URL**: Socket.IO WebSocket endpoint (usually same as API_URL)
- **ENV**: Environment name ('development', 'production')
- **isDevelopment**: Boolean for development-specific features
- **isProduction**: Boolean for production-specific features

## Environment-Specific Configs

### Development (Local):
```javascript
API_URL: 'http://10.100.130.164:5002'
SOCKET_URL: 'http://10.100.130.164:5002'
```

### Production (Render):
```javascript
API_URL: 'https://dogmatch-backend.onrender.com'
SOCKET_URL: 'https://dogmatch-backend.onrender.com'
```

## Notes

- The `config.js` file is gitignored to keep your local settings private
- Always use `config.example.js` as a template
- Update both API_URL and SOCKET_URL when switching environments
- Restart your React Native app after changing the config
