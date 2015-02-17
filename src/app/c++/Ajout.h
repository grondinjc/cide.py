/****************************************************************************
 *  Classe: 			Ajout				     																					*
 *  Auteur: 			Mariane Maynard 																					*
 *	Description:	Representation d'un ajout de l'utilisateur    				  	*
 ****************************************************************************/

#ifndef AJOUT
#define AJOUT

#include "Fichier.h"
//#include <boost/python.hpp>

using namespace boost::python;
using boost::shared_ptr;

class Ajout : public Modification//, wrapper<Modification>
{
	private:
		string _data;
    
	public:
    Ajout() = default;

    Ajout(uint position, size_t taille, const shared_ptr<Fichier>& fichier, const char* data)
      : Modification(position, taille, fichier)
			, _data{data}
    {}

    Ajout(uint position, size_t taille, const shared_ptr<Fichier>& fichier, const string& data)
      : Modification(position, taille, fichier)
			, _data{data}
    {}

    Ajout(uint position, const shared_ptr<Fichier>& fichier, const string& data)
      : Modification(position, data.size(), fichier)
			, _data{data}
    {}

    Ajout(uint position, const shared_ptr<Fichier>& fichier, const char* data)
      : Modification(position, strlen(data), fichier)
			, _data{data}
    {}

		virtual void effectuerModification() override
		{
			getFichier()->inserer(_data.c_str(), getPosition(), getTaille());
		}
};

#endif //AJOUT
