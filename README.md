📝 Akıllı Form Oluşturma Sistemi (Form Builder PWA)
Bu proje, teknik bilgi gerektirmeden dinamik, akıllı ve çevrimdışı çalışabilen formlar tasarlamak amacıyla geliştirdiğim tam kapsamlı bir web uygulamasıdır. Kullanıcıların sürükle-bırak yöntemiyle form oluşturmasına, bu formlara mantıksal kurallar eklemesine ve internet bağlantısı olmasa bile veri toplamasına olanak tanır.

🚀 Öne Çıkan Özellikler
Sürükle-Bırak Tasarımcı: Karmaşık kodlarla uğraşmadan, görsel bir arayüz üzerinden saniyeler içinde form bileşenleri ekleme.

Gelişmiş Kural Motoru (Rule Engine): Formlara IF-THEN mantığı ekleyerek dinamik alanlar (cevaplara göre gizlenen/gösterilen sorular) oluşturma.

PWA Altyapısı & Çevrimdışı Mod: İnternet kesilse dahi form doldurma ve düzenleme imkanı.

IndexedDB ile Veri Senkronizasyonu: Çevrimdışı girilen verilerin yerel hafızada tutulması ve bağlantı sağlandığında sunucuya otomatik/manuel aktarımı.

Konteyner Yapısı: Docker desteği sayesinde her ortamda sorunsuz kurulum.

🛠️ Teknoloji Yığını
Frontend: Next.js (React Framework), Tailwind CSS

Backend: NestJS (Node.js Framework)

Veritabanı & ORM: PostgreSQL & Prisma ORM

Çevrimdışı Depolama: IndexedDB & Service Workers

Dağıtım: Docker & Docker-Compose

📂 Proje Yapısı ve Diyagramlar
Proje geliştirme sürecinde sistemin mimarisini ve işleyişini netleştirmek için hazırladığım dökümanlar:

Sınıf Diyagramı: Veri modelleri ve metodların ilişkisi.

Kullanım Durum (Use Case) Diyagramı: Yönetici ve kullanıcı rollerinin yetkileri.

Sıralama (Sequence) Diyagramı: Kural motorunun ve kayıt sürecinin adım adım akışı.

ERD: PostgreSQL tablo ilişkileri.

📋 Kabul ve Kısıtlar
Uygulama, backend tarafında Docker ve PostgreSQL'in kurulu olduğunu varsayar.

Kural motoru bu versiyonda temel mantıksal (eşittir, büyüktür vb.) operatörleri desteklemektedir.

Veri güvenliği için Prisma Transaction yapısı kullanılarak veritabanı tutarlılığı sağlanmıştır.
