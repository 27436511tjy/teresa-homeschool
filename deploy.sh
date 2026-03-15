#!/bin/bash
# Teresa's Homeschool AI Tutor - 一键部署脚本

echo "=========================================="
echo "  Teresa's AI Learning Hub 部署脚本"
echo "=========================================="

# 1. 更新系统
echo "[1/6] 更新系统..."
apt update && apt upgrade -y

# 2. 安装 Node.js
echo "[2/6] 安装 Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 3. 安装 Nginx
echo "[3/6] 安装 Nginx..."
apt install -y nginx

# 4. 创建项目目录
echo "[4/6] 创建项目目录..."
mkdir -p /var/www/teresa-homeschool
cd /var/www/teresa-homeschool

# 5. 上传项目文件 (需要手动上传或用 git clone)
echo "[5/6] 请上传项目文件..."
echo "请将本地 /Users/tongda/.openclaw/workspace/homeschool/ 目录下的文件上传到服务器"
echo "可以使用 scp 命令:"
echo "  scp -r /Users/tongda/.openclaw/workspace/homeschool/* taojingyuan@139.199.178.107:/var/www/teresa-homeschool/"

# 6. 配置 Nginx
echo "[6/6] 配置 Nginx..."
cat > /etc/nginx/sites-available/teresa-homeschool << 'EOF'
server {
    listen 80;
    server_name 139.199.178.107;

    root /var/www/teresa-homeschool/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/teresa-homeschool /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 7. 启动后端服务
echo ""
echo "=========================================="
echo "  部署完成！"
echo "=========================================="
echo "请访问: http://139.199.178.107"
echo ""
echo "后续步骤:"
echo "1. 上传项目文件到 /var/www/teresa-homeschool/"
echo "2. 安装依赖: cd /var/www/teresa-homeschool/server && npm install"
echo "3. 启动后端: cd /var/www/teresa-homeschool/server && nohup node index.js &"
echo "4. 重启 Nginx: systemctl restart nginx"
