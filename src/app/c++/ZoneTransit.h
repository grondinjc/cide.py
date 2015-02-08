/****************************************************************************
 *  Classe: 			ZoneTransit     																					*
 *  Auteur: 			Mariane Maynard 																					*
 *	Description:	Classe servant a stocker temporairement les modifications	*
									d'un fichier sur le serveur en attendant d'etre resolues	*
 ****************************************************************************/

#include <vector>
#include <mutex>
#include "Modification.h"
#include "Fichier.h"

#ifndef ZONE_TRANSIT
#define ZONE_TRANSIT

using std::vector;
using std::mutex;
using std::lock_guard;

class ZoneTransit
{
  private:
    vector<Modification> _modifications;
    Fichier _file;
    mutex _mutex;

  public:
    //ctor par defaut
    ZoneTransit()
      : _modifications{}
      , _file{}
      , _mutex{}
    {}

    //Sainte-Trinite
		//n.b : assurez-vous d'avoir une ste-trinite fonctionnelle (implicite ou explicite) avec BOOST_PYTHON

    //ctor de copie
    ZoneTransit(const ZoneTransit &zt)
      : _modifications{zt._modifications}
      , _file{zt._file}
      , _mutex{}
    {}

    //swap
    void swap(const ZoneTransit &zt)
    {
      using std::swap;
      //swap(_modifications, zt._modifications);
      //swap(_file, zt._file);
    }

    //assignment
    ZoneTransit& operator=(const ZoneTransit &zt)
    {
      ZoneTransit{zt}.swap(*this);
      return *this;
    }

		//ajoute les Modifications par ordre croissant de leur position
    void add(Modification m)
		{
			lock_guard<mutex> lock{_mutex};

			for(auto it = _modifications.begin(); it != _modifications.end(); ++it)
			{
				if(it->getPosition() > m.getPosition())
				{
					_modifications.insert(it,m);
					break;
				}
			}
		}

		//enleve et retourne le dernier element (avec la plus grande position)
    Modification remove()
		{
			lock_guard<mutex> lock{_mutex};

			Modification m = _modifications.back();
			_modifications.pop_back();
			return m;
		}
};

#endif //ZONE_TRANSIT

