Berikut saya buatkan **README.md** untuk GitHub project-mu yang sesuai dengan stack dan keterangan yang kamu berikan:

````markdown
# Lost and Found API

API ini dibuat untuk **mengelola sistem Lost and Found**, termasuk manajemen user, item hilang/temuan, autentikasi, dan upload file.

---

## Stack

- **Programming Language**: Node.js + Express v5.1.0  
- **ORM**: Prisma v6.19.0  
- **Authentication**: JSON Web Token (jsonwebtoken v9.0.2)  
- **File Upload**: Multer v2.0.2  
- **Database**: PostgreSQL v17.6.1  

---

## Setup Project

1. **Clone repository**  

```bash
git clone https://github.com/megustaSzy/api-lost-and-found
cd api
````

2. **Install dependencies**

```bash
npm install
```

3. **Environment variables**

* Salin file `.env.example` menjadi `.env`

```bash
cp .env.example .env
```

* Edit `.env` sesuai konfigurasi lokalmu, misalnya database URL, JWT secret, dsb.

4. **Prisma setup & migrate**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

> Perintah `migrate` akan membuat tabel di database PostgreSQL sesuai schema Prisma.

5. **Jalankan server**

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3001` (atau sesuai konfigurasi).

---

## Notes

* Gunakan **Postman atau Insomnia** untuk testing API.
* Upload file menggunakan **Multer**, disimpan di folder `/uploads`.
* Pastikan **PostgreSQL** sudah running dan URL di `.env` benar.

---

## License

MIT License

```

