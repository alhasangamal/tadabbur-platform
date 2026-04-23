import psycopg2

def update_data():
    conn = psycopg2.connect(
        host="localhost",
        dbname="TadabburData",
        user="postgres",
        password="123456"
    )
    cur = conn.cursor()

    # Al-Fatiha
    cur.execute("""
        UPDATE surahs 
        SET other_names_ar = 'أم الكتاب، الشفاء، السبع المثاني', 
            naming_reason_ar = 'سُميت الفاتحة لأنها تفتح القرآن الكريم وتفتتح بها الصلاة، وهي كخلاصة لكل معاني الكتاب.' 
        WHERE surah_number = 1
    """)

    # Al-Baqarah
    cur.execute("""
        UPDATE surahs 
        SET other_names_ar = 'سنام القرآن، الزهراء', 
            naming_reason_ar = 'سُميت بهذا الاسم لورود قصة البقرة المعجزة التي أمر الله بني إسرائيل بذبحها كشفاً لقاتل القتيل، وفيها توجيه للمسارعة في الطاعة.' 
        WHERE surah_number = 2
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("Data updated successfully")

if __name__ == "__main__":
    update_data()
