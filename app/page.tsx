import Link from 'next/link';

export default function Home() {
  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-3xl shadow-lg px-6 py-20 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
          Bienvenue chez <span className="underline decoration-white/30">IRATA Formation</span>
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Des formations professionnelles de qualité pour booster votre avenir.
        </p>
        <Link
          href="/formations"
          className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-full shadow-md hover:bg-blue-50 transition duration-300"
        >
          Découvrir nos formations
        </Link>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {[
          {
            title: 'Formations Certifiantes',
            text: 'Des formations reconnues et certifiantes pour valoriser vos compétences.',
          },
          {
            title: 'Experts Qualifiés',
            text: 'Des formateurs expérimentés pour un apprentissage optimal.',
          },
          {
            title: 'Suivi Personnalisé',
            text: 'Un accompagnement individualisé tout au long de votre formation.',
          },
        ].map((feature, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-semibold text-blue-700 mb-4">{feature.title}</h3>
            <p className="text-gray-600">{feature.text}</p>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 rounded-3xl p-10 text-center shadow-inner">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Prêt à commencer votre formation ?
        </h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Rejoignez-nous dès aujourd'hui et donnez un nouvel élan à votre parcours professionnel.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/demande"
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
          >
            Faire une demande
          </Link>
          <Link
            href="/contact"
            className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
          >
            Nous contacter
          </Link>
        </div>
      </section>
    </main>
  );
}
