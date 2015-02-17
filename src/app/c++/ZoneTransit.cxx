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
#include "Ajout.h"
#include "Suppression.h"
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
		.def(init<const shared_ptr<Fichier>&>())
		.def("add", &ZoneTransit::add)
		.def("remove", &ZoneTransit::remove)
		.def("ecrireModifications", &ZoneTransit::ecrireModifications);

	//Definit la classe Modification (non instantiable, abstraite) et le type shared_ptr<Modification>
	class_<Modification, boost::noncopyable, shared_ptr<Modification>>("Modification", no_init)
	//add_property ajoute un attribut, auquel on peut spécifier une fonction get et une fonction set (utilise comme get et set en c#)
	//dans ce cas, je specifie seulement le get, donc les attributs sont publics en read only seulement
		.add_property("position", &Modification::getPosition)
		.add_property("taille", &Modification::getTaille)
		.add_property("fichierID", &Modification::getFichier)
		.def("effectuer", &Suppression::effectuerModification);

	//Definit Ajout heritant de Modification
	class_<Ajout, bases<Modification>, shared_ptr<Ajout>>("Ajout")
		.def(init<int, int, const shared_ptr<Fichier>&, char*>())
		.def(init<int, int, const shared_ptr<Fichier>&, const string&>())
		.def(init<int, const shared_ptr<Fichier>&, char*>())
		.def(init<int, const shared_ptr<Fichier>&, const string&>());

	class_<Suppression, bases<Modification>, shared_ptr<Suppression>>("Suppression")
		.def(init<int, int, const shared_ptr<Fichier>&>());

	//Definit la classe Fichier. La classe Fichier en c++ n'est pas instantiable
	//c'est pourquoi je definis le constructeur manuellement avec les factory method
	//de la classe. L'objet utilise sera donc en fait un SFichier
	class_<Fichier, boost::noncopyable, shared_ptr<Fichier>>("Fichier", no_init)
		.def("__init__", make_constructor(cf1))
		.def("__init__", make_constructor(cf2))
		.def("ecrireSurDisque", &Fichier::ecrireSurDisque)
		.def("inserer", &Fichier::inserer)
		.def("supprimer", &Fichier::supprimer)
		.def("printContenu", &Fichier::printContenu);
}
