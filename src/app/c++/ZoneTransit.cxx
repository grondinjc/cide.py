/****************************************************************************
 *  Librairie: 		LibZoneTransit     																				*
 *  Auteur: 			Mariane Maynard 																					*
 *	Description:	Construction de la librairie boost python de la classe 		*
 *								ZoneTransit, Modification et Fichier											*
 ****************************************************************************/

#include <boost/python.hpp>
#include "ZoneTransit.h"
#include "SFichier.h"
#include "Fichier.h"
#include <string>

using namespace boost::python;
using std::string;
using boost::shared_ptr;

BOOST_PYTHON_MODULE(libZoneTransit)
{	
	//Prendre les pointeurs des fonctions surchargées Fichier::CreateFichier
	shared_ptr<Fichier> (*cf1)(const string&) = &Fichier::CreateFichier;;
	shared_ptr<Fichier> (*cf2)(const char*, string) = &Fichier::CreateFichier;

	class_<ZoneTransit, boost::noncopyable>("ZoneTransit")
		.def(init<shared_ptr<Fichier>>())
		.def("add", &ZoneTransit::add)
		.def("remove", &ZoneTransit::remove);

	class_<Modification>("Modification")
		.def(init<int, int, shared_ptr<Fichier>>())
		.add_property("position", &Modification::getPosition)
		.add_property("taille", &Modification::getTaille)
		.add_property("fichierID", &Modification::getFichier);

	class_<Fichier, boost::noncopyable, shared_ptr<Fichier>>("Fichier", no_init)
		.def("__init__", make_constructor(cf1))
		.def("__init__", make_constructor(cf2))
		.def("ecrireSurDisque", &Fichier::ecrireSurDisque)
		.def("inserer", &Fichier::inserer)
		.def("supprimer", &Fichier::supprimer);

	//class_<shared_ptr<Fichier>>("FichierPtr");
	//	.def("__eq__", &shared_ptr<Fichier>::get);
}
