import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type LegalDocumentRouteProp = RouteProp<RootStackParamList, "LegalDocument">;

const LEGAL_DOCUMENTS: Record<string, { title: string; content: string }> = {
  "kullanim-kosullari": {
    title: "Kullanım Koşulları",
    content: `Araç Takası Kullanım Koşulları

Son Güncelleme: Ocak 2026

1. Giriş
Araç Takası uygulamasını ("Uygulama") kullanarak bu kullanım koşullarını kabul etmiş olursunuz. Bu koşulları kabul etmiyorsanız, lütfen uygulamayı kullanmayın.

2. Hizmet Tanımı
Araç Takası, kullanıcıların araçlarını takas etmelerine olanak sağlayan bir platformdur. Platform, alıcı ve satıcıları bir araya getirmekte olup, takas işlemlerinin doğrudan tarafı değildir.

3. Üyelik
- Üye olmak için 18 yaşından büyük olmanız gerekmektedir
- Kayıt sırasında verilen bilgilerin doğruluğundan kullanıcı sorumludur
- Her kullanıcı yalnızca bir hesap açabilir
- Hesap bilgilerinizin gizliliğinden siz sorumlusunuz

4. İlan Kuralları
- İlanlar gerçek ve güncel bilgiler içermelidir
- Yanıltıcı fotoğraf veya bilgi paylaşımı yasaktır
- Yasadışı veya çalıntı araç ilanı kesinlikle yasaktır
- Her kullanıcı en fazla 5 aktif ilan yayınlayabilir

5. Yasaklı Davranışlar
- Sahte veya yanıltıcı ilan vermek
- Diğer kullanıcılara hakaret veya tehdit
- Spam veya istenmeyen mesaj göndermek
- Platformu kötüye kullanmak

6. Sorumluluk Reddi
Araç Takası, kullanıcılar arasındaki işlemlerden sorumlu değildir. Takas işlemleri tamamen kullanıcıların kendi sorumluluğundadır.

7. Değişiklikler
Bu kullanım koşulları önceden haber vermeksizin değiştirilebilir. Güncel koşulları takip etmek kullanıcının sorumluluğundadır.

8. İletişim
Sorularınız için: info@aractakasi.com`,
  },
  "gizlilik-politikasi": {
    title: "Gizlilik Politikası",
    content: `Araç Takası Gizlilik Politikası

Son Güncelleme: Ocak 2026

1. Toplanan Veriler
Araç Takası olarak aşağıdaki kişisel verileri topluyoruz:
- Ad, soyad, telefon numarası
- E-posta adresi (opsiyonel)
- Araç bilgileri ve fotoğrafları
- Konum bilgisi (şehir/ilçe)
- Uygulama kullanım verileri

2. Verilerin Kullanım Amacı
Toplanan veriler şu amaçlarla kullanılmaktadır:
- Hesap oluşturma ve yönetimi
- İlan yayınlama ve eşleştirme
- Kullanıcılar arası iletişim
- Platform güvenliğinin sağlanması
- Hizmet kalitesinin iyileştirilmesi

3. Veri Paylaşımı
Kişisel verileriniz:
- Yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz
- Reklam amaçlı satılmaz veya kiralanmaz
- Güvenli sunucularda şifreli olarak saklanır

4. Veri Güvenliği
- Tüm veriler SSL/TLS şifreleme ile korunmaktadır
- Düzenli güvenlik denetimleri yapılmaktadır
- Yetkisiz erişime karşı koruma mevcuttur

5. Kullanıcı Hakları
- Verilerinize erişim talep edebilirsiniz
- Verilerinizin düzeltilmesini isteyebilirsiniz
- Hesabınızı ve verilerinizi silebilirsiniz

6. Çerezler
Uygulama, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. Detaylar için Çerez Politikamızı inceleyiniz.

7. İletişim
Gizlilik sorularınız için: info@aractakasi.com`,
  },
  "kvkk": {
    title: "KVKK Aydınlatma Metni",
    content: `Araç Takası KVKK Aydınlatma Metni

6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma Metni

Son Güncelleme: Ocak 2026

1. Veri Sorumlusu
Araç Takası Teknoloji A.Ş. olarak kişisel verilerinizin güvenliği konusunda azami hassasiyet göstermekteyiz.

2. Kişisel Verilerin İşlenme Amacı
Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
- Üyelik işlemlerinin gerçekleştirilmesi
- Hizmetlerin sunulması ve iyileştirilmesi
- Yasal yükümlülüklerin yerine getirilmesi
- Güvenlik ve dolandırıcılık önleme

3. İşlenen Kişisel Veri Kategorileri
- Kimlik bilgileri (ad, soyad)
- İletişim bilgileri (telefon, e-posta)
- Araç bilgileri
- İşlem güvenliği bilgileri

4. Kişisel Verilerin Aktarımı
Kişisel verileriniz:
- Yasal zorunluluklar çerçevesinde yetkili kurumlara
- Hizmet sağlayıcılarımıza (güvenli şekilde)
aktarılabilmektedir.

5. Veri Sahibinin Hakları (Madde 11)
KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:
a) Kişisel verilerinizin işlenip işlenmediğini öğrenme
b) İşlenmişse buna ilişkin bilgi talep etme
c) İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme
d) Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme
e) Eksik veya yanlış işlenmişse düzeltilmesini isteme
f) KVKK'nın 7. maddesi kapsamında silinmesini veya yok edilmesini isteme
g) Düzeltme, silme veya yok edilme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme
h) İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme
i) Kanuna aykırı işleme sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme

6. Başvuru
Haklarınızı kullanmak için info@aractakasi.com adresine başvurabilirsiniz.`,
  },
  "mesafeli-satis": {
    title: "Mesafeli Satış Sözleşmesi",
    content: `Araç Takası Mesafeli Satış Sözleşmesi

Son Güncelleme: Ocak 2026

1. Taraflar
İşbu sözleşme, Araç Takası Teknoloji A.Ş. ("Platform") ile platform üzerinden hizmet alan kullanıcı ("Kullanıcı") arasında akdedilmiştir.

2. Sözleşmenin Konusu
Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerini düzenler.

3. Hizmetin Özellikleri
Araç Takası, araç takas hizmeti sunan bir aracı platformdur:
- Ücretsiz üyelik ve ilan yayınlama
- Premium üyelik özellikleri (opsiyonel)
- Eşleştirme ve mesajlaşma hizmetleri

4. Hizmet Bedeli
- Temel hizmetler ücretsizdir
- Premium özellikler için ücretlendirme yapılabilir
- Ücretler uygulama içinde açıkça belirtilir

5. Cayma Hakkı
- Ücretli hizmetlerde 14 gün içinde cayma hakkınız bulunmaktadır
- Cayma talebinizi uygulama üzerinden veya e-posta ile iletebilirsiniz
- Cayma halinde ödeme 14 gün içinde iade edilir

6. Kullanıcı Yükümlülükleri
- Gerçek ve doğru bilgi paylaşmak
- Platform kurallarına uymak
- Diğer kullanıcılara saygılı davranmak

7. Platform Yükümlülükleri
- Hizmetin kesintisiz sunulması için çaba göstermek
- Kullanıcı verilerini korumak
- Şikayet ve talepleri değerlendirmek

8. Uyuşmazlık Çözümü
Uyuşmazlıklarda Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.

9. İletişim
Sözleşme ile ilgili sorularınız için: info@aractakasi.com`,
  },
  "cerez-politikasi": {
    title: "Çerez Politikası",
    content: `Araç Takası Çerez Politikası

Son Güncelleme: Ocak 2026

1. Çerez Nedir?
Çerezler, ziyaret ettiğiniz uygulamalar tarafından cihazınıza yerleştirilen küçük veri dosyalarıdır. Bu dosyalar, uygulamanın düzgün çalışmasını sağlar ve kullanıcı deneyimini iyileştirir.

2. Kullandığımız Çerez Türleri

a) Zorunlu Çerezler
- Uygulamanın temel işlevleri için gereklidir
- Oturum yönetimi ve güvenlik sağlar
- Devre dışı bırakılamaz

b) Performans Çerezleri
- Uygulama kullanım istatistiklerini toplar
- Hizmet kalitesini iyileştirmemize yardımcı olur
- Anonim veriler içerir

c) İşlevsellik Çerezleri
- Tercihlerinizi hatırlar (dil, bölge vb.)
- Kişiselleştirilmiş deneyim sunar

d) Hedefleme/Reklam Çerezleri
- İlgi alanlarınıza uygun içerik gösterir
- Üçüncü taraf hizmetleri içerebilir

3. Çerez Yönetimi
Çerez tercihlerinizi aşağıdaki yollarla yönetebilirsiniz:
- Uygulama ayarları üzerinden
- Cihaz tarayıcı ayarlarından
- İşletim sistemi gizlilik ayarlarından

4. Üçüncü Taraf Çerezleri
Uygulamamızda aşağıdaki üçüncü taraf hizmetleri kullanılabilir:
- Google Analytics (analiz)
- Firebase (performans izleme)

5. Çerezleri Reddetme
Çerezleri reddetmeniz halinde bazı özellikler düzgün çalışmayabilir. Zorunlu çerezler uygulamanın temel işlevleri için gereklidir.

6. Değişiklikler
Bu politika gerektiğinde güncellenebilir. Önemli değişiklikler uygulama içinden bildirilir.

7. İletişim
Çerez politikası hakkında sorularınız için: info@aractakasi.com`,
  },
};

export default function LegalDocumentScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<LegalDocumentRouteProp>();
  const { documentType } = route.params;

  const document = LEGAL_DOCUMENTS[documentType];

  if (!document) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
          >
            <Feather name="arrow-left" size={24} color="#000000" />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Belge Bulunamadı</ThemedText>
          <View style={styles.backButton} />
        </View>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>İstenen belge bulunamadı.</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Feather name="arrow-left" size={24} color="#000000" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>{document.title}</ThemedText>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.content}>{document.content}</ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  content: {
    fontSize: 15,
    lineHeight: 24,
    color: "#374151",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});
