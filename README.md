# PDF ile İnteraktif Sınav

Bu proje, PDF formatındaki sınav dosyalarını interaktif hale getirmek için tasarlanmış bir uygulamadır. Kullanıcılar, PDF dosyalarını yükleyerek sınavı çözebilir ve sonuçlarını görebilirler.

## Özellikler

- PDF formatındaki sınav dosyalarını yükleme
- Sınavı çözme ve doğru/yanlış cevapları kontrol etme
- Net puanın hesaplanması
- Sınavı yeniden başlatma özelliği

## Nasıl Kullanılır

1. Projeyi bilgisayarınıza klonlayın veya ZIP olarak indirin.
2. İndirdiğiniz dosyaları bir dizine çıkartın.
3. Python ile `soru.py` dosyasını çalıştırın.
4. Sınav sorularını içeren PDF dosyasını ekrandan seçin.
5. Tarayıcınızda `src/quiz.html` dosyasını açın.
6. Projeyi indirdiğiniz klasörde iki adet JSON dosyası oluşturulacak (answers.json ve questions.json) onları seçin.
7. Cevapları işaretleyin ve "Gönder" düğmesine tıklayarak sonuçları görüntüleyin.

## Gereksinimler

- Modern bir web tarayıcısı (Google Chrome, Mozilla Firefox, Safari, vb.)
- Python 3.x
- Projenin çalışması için gereken Python paketlerini yüklemek için aşağıdaki komutu çalıştırın:

    ```
    pip install -r requirements.txt
    ```

## Örnekler
examples/ klasöründe, bir interaktif sınav için örnek dosyalar bulunmaktadır:
- quiz.html: Soruların görüntülenebildiği HTML dosyası.
- questions.json: Soruların ve şıkların JSON formatında listesi.
- answers.json: Cevapların JSON formatında listesi.

## Mevcut Sorunlar
- Çoğu deneme/sınav sorularıyla uyumlu değil.
- Görselli sorularla uyumlu değil.
- Paragraflı sorularla uyumlu değil.
- PDF'in içindeki sorularla alakası olmayan metinler bazen sorulara yahut şıklara dahil ediliyor.

## Katkıda Bulunma

Katkılarınızı memnuniyetle karşılıyoruz! Eğer bir hata bulduysanız veya yeni bir özellik eklemek istiyorsanız lütfen bir pull isteği gönderin. Ayrıca herhangi bir sorunuz varsa, GitHub üzerinden bir sorun açabilirsiniz.

## Lisans

Bu proje GNU Genel Kamu Lisansı altında lisanslanmıştır. Daha fazla bilgi için [LICENSE](LICENSE) dosyasını inceleyebilirsiniz.