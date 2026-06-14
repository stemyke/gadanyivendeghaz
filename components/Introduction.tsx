import React from 'react';

export default function Introduction() {
  return (
    <section className="py-24 bg-stone-50 relative">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-emerald-900 mb-6">Üdvözöljük a Mecsek Szívében!</h2>
        <div className="text-stone-600 text-lg leading-relaxed space-y-4">
          <p>
            Komló az ország egyik legszebb hegységében, a Pécs környéki Mecsekben fekszik. 
            Szálláshelyünk a városközponttól mindössze 4 km-re található, csendes, nyugodt vonzáskörzetben. 
            Közvetlenül az erdőszéli halastavak mellett helyezkedünk el, így családias hangulatot nyújtunk, 
            amely aktív és passzív pihenésre egyaránt kiváló lehetőséget biztosít vendégeink számára.
          </p>
          <p>
            A Mecsek összes fontos látnivalója 20 km-es körzetben kényelmesen elérhető. 
            Fedezze fel a Dávidföldi Mini Zoo állatsimogatót, tegyen egy kellemes pécsi városnéző sétát, 
            pihenjen az Orfűi-tónál vagy a Hertelendi Termálfürdőben, és csodálja meg az Abaligeti Cseppkőbarlangot!
          </p>
        </div>
      </div>
    </section>
  );
}
