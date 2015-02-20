/****************************************************************************
 *  Librairie:    LibZoneTransit                                            *
 *  Auteur:       Mariane Maynard                                           *
 *  Description:  Construction de la librairie boost python de la classe    *
 *                ZoneTransit, Modification et Fichier                      *
 ****************************************************************************/

#include <boost/python.hpp>
#include "ZoneTransit.h"
#include "SFichier.h"
#include "Fichier.h"
#include "Ajout.h"
#include "Suppression.h"
#include <string>
#include "Types.h"

using namespace boost::python;
using std::string;
using boost::shared_ptr;
using namespace types;

BOOST_PYTHON_MODULE(libZoneTransit)
{
  //Definit la classe Fichier. Fichier est un alias pour FichierType<string>
  class_<Fichier, boost::noncopyable>("Fichier")
    .def(init<const string &>())
    .def("ecrireSurDisque", &Fichier::ecrireSurDisque)
    .def("inserer", &Fichier::inserer)
    .def("supprimer", &Fichier::supprimer)
    .def("printContenu", &Fichier::printContenu)
    .add_property("contenu", &Fichier::getContenu);

  class_<ZoneTransit, boost::noncopyable>("ZoneTransit")
    .def(init<const string&>())
    .def("add", &ZoneTransit::add)
    .def("remove", &ZoneTransit::remove)
    .def("ecrireModifications", &ZoneTransit::ecrireModifications)
    .add_property("contenu", &ZoneTransit::getContenu);

  //Definit la classe Modification (non instantiable, abstraite) et le type shared_ptr<Modification>
  class_<Modification, boost::noncopyable, shared_ptr<Modification>>("Modification", no_init)
  //add_property ajoute un attribut, auquel on peut spécifier une fonction get et une fonction set (utilise comme get et set en c#)
  //dans ce cas, je specifie seulement le get, donc les attributs sont publics en read only seulement
    .add_property("position", &Modification::getPosition)
    .add_property("taille", &Modification::getTaille)
    .def("effectuer", &Modification::effectuerModification);

  //Definit Ajout heritant de Modification
  class_<Ajout, bases<Modification>, shared_ptr<Ajout>>("Ajout")
    .def(init<int, int, char*>())
    .def(init<int, int, const string&>())
    .def(init<int, char*>())
    .def(init<int, const string&>());

  class_<Suppression, bases<Modification>, shared_ptr<Suppression>>("Suppression")
    .def(init<int, int>());
}
