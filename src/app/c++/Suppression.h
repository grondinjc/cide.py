/****************************************************************************
 *  Classe: 			Suppression				     																		*
 *  Auteur: 			Mariane Maynard 																					*
 *	Description:	Representation d'une supression de l'utilisateur 			  	*
 ****************************************************************************/

#ifndef SUPPRESSION
#define SUPPRESSION

#include "Fichier.h"
//#include <boost/python.hpp>

//using namespace boost::python;
using boost::shared_ptr;

class Suppression : public Modification//, wrapper<Modification>
{    
	public:
    Suppression() = default;

    Suppression(uint position, size_t taille, const shared_ptr<Fichier>& fichier)
      : Modification(position, taille, fichier)
    {}

		virtual void effectuerModification() override
		{
			getFichier()->supprimer(getPosition(), getTaille());
		}
};

#endif //SUPPRESSION
