# Fix Google OAuth Error: redirect_uri_mismatch

## Vấn đề hiện tại:

Redirect URI đang là: `http://app/user/oauth2/redirect/google`

Điều này xảy ra vì `BASE_URL` chưa được set đúng trong `.env` trên EC2.

## Giải pháp:

### Bước 1: Thêm BASE_URL vào .env trên EC2

```bash
# SSH vào EC2
ssh ubuntu@13.55.81.255
cd ~/appbanhang

# Sửa file .env
nano .env
```

Thêm dòng này (nếu chưa có):
```env
BASE_URL=https://thuong-electronic.io.vn
```dsdasdsad

**Lưu ý:**
- Dùng `https://` nếu website đã có SSL
- Dùng `http://` nếu chưa có SSL
- Không có trailing slash ở cuối

### Bước 2: Cập nhật Google Cloud Console

1. Vào: https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Click vào OAuth 2.0 Client ID của bạn
4. Trong **Authorized redirect URIs**, thêm:
   ```
   https://thuong-electronic.io.vn/user/oauth2/redirect/google
   ```
5. Click **Save**

### Bước 3: Rebuild và restart

```bash
# Trên EC2
cd ~/appbanhang

# Pull image mới (nếu đã push code lên GitHub và GitHub Actions đã build)
docker-compose pull

# Hoặc rebuild local
docker-compose build app

# Restart
docker-compose down
docker-compose up -d
```

### Bước 4: Kiểm tra BASE_URL

```bash
# Kiểm tra biến môi trường trong container
docker-compose exec app env | grep BASE_URL

# Xem logs để kiểm tra callbackURL
docker-compose logs app | grep "OAuth callbackURL"
```

Kết quả mong đợi:
```
Google OAuth callbackURL: https://thuong-electronic.io.vn/user/oauth2/redirect/google
```

### Bước 5: Test lại

1. Truy cập: https://thuong-electronic.io.vn/user/login
2. Click "Đăng nhập với Google"
3. Kiểm tra xem có còn lỗi không

## Cấu hình đầy đủ trong Google Cloud Console:

### Authorized JavaScript origins:
```
https://thuong-electronic.io.vn
https://www.thuong-electronic.io.vn
```

### Authorized redirect URIs:
```
https://thuong-electronic.io.vn/user/oauth2/redirect/google
https://www.thuong-electronic.io.vn/user/oauth2/redirect/google
```

## Troubleshooting:

### Vẫn thấy `http://app/user/oauth2/redirect/google` trong logs:

1. **Kiểm tra .env file:**
   ```bash
   cat .env | grep BASE_URL
   ```

2. **Kiểm tra docker-compose.yml có load .env không:**
   ```yaml
   services:
     app:
       env_file:
         - .env
   ```

3. **Restart container để load biến môi trường mới:**
   ```bash
   docker-compose restart app
   ```

### BASE_URL không được load:

Nếu dùng `docker-compose.yml` với `env_file`, đảm bảo file `.env` nằm cùng thư mục với `docker-compose.yml`.

Hoặc thêm trực tiếp vào `docker-compose.yml`:
```yaml
services:
  app:
    environment:
      - BASE_URL=https://thuong-electronic.io.vn
```

### Test với localhost:

Nếu test local, trong `.env` local:
```env
BASE_URL=http://localhost:3000
```

Và trong Google Console thêm:
```
http://localhost:3000/user/oauth2/redirect/google
```

## Lưu ý:

1. **HTTPS vs HTTP:** Production nên dùng HTTPS
2. **Không có trailing slash:** `/user/oauth2/redirect/google` (đúng), không phải `/user/oauth2/redirect/google/`
3. **Domain chính xác:** Phải khớp chính xác với domain trong Google Console
4. **Đợi vài phút:** Sau khi cập nhật Google Console, đợi 1-2 phút để changes có hiệu lực

