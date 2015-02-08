/****************************************************************************
 *  Librairie: 		LibZoneTransit     																				*
 *  Auteur: 			Mariane Maynard 																					*
 *	Description:	Construction de la librairie boost python de la classe 		*
									ZoneTransit, Modification et Fichier											*
 ****************************************************************************/

#include <boost/python.hpp>
#include "ZoneTransit.h"

using namespace boost::python;

BOOST_PYTHON_MODULE(libZoneTransit)
{
	class_<ZoneTransit>("ZoneTransit", init<>())
		.def("add", &ZoneTransit::add)
		.def("remove", &ZoneTransit::remove);

	class_<Modification>("Modification", init<>())
		.def(init<int, int>())
		.add_property("position", &Modification::getPosition)
		.add_property("taille", &Modification::getTaille);

	class_<Fichier>("Fichier", 
}

