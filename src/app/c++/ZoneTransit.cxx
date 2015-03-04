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
  class_<Fichier, boost::noncopyable>("File")
    .def(init<const string &>())
    .def("writeToDisk", &Fichier::ecrireSurDisque)
    .def("insert", &Fichier::inserer)
    .def("delete", &Fichier::supprimer)
    .def("printContent", &Fichier::printContenu)
    .add_property("content", &Fichier::getContenu);

  class_<ZoneTransit, boost::noncopyable>("TransitZone")
    .def(init<const string&>())
    .def("add", &ZoneTransit::add)
    .def("writeModifications", &ZoneTransit::ecrireModifications)
    .def("isEmpty", &ZoneTransit::estVide)
    .add_property("content", &ZoneTransit::getContenu);

  //Definit la classe Modification (non instantiable, abstraite) et le type shared_ptr<Modification>
  class_<Modification, boost::noncopyable, shared_ptr<Modification>>("Modification", no_init)
  //add_property ajoute un attribut, auquel on peut spécifier une fonction get et une fonction set (utilise comme get et set en c#)
  //dans ce cas, je specifie seulement le get, donc les attributs sont publics en read only seulement
    .add_property("position", &Modification::getPosition)
    .add_property("size", &Modification::getTaille)
    .def("apply", &Modification::effectuerModification)
    .def("update", &Modification::mettreAJour);

  //Definit Ajout heritant de Modification
  class_<Ajout, bases<Modification>, shared_ptr<Ajout>>("Addition")
    .def(init<pos_t, size_t, const string&>())
    .def(init<pos_t, const string&>());

  class_<Suppression, bases<Modification>, shared_ptr<Suppression>>("Removal")
    .def(init<pos_t, size_t>());
}
