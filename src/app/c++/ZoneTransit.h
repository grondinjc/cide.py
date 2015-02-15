/****************************************************************************
 *  Classe: 			ZoneTransit     																					*
 *  Auteur: 			Mariane Maynard 																					*
 *	Description:	Classe servant a stocker temporairement les modifications	*
 *								d'un fichier sur le serveur en attendant d'etre resolues	*
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
using std::string;
using boost::shared_ptr;

class ZoneTransit
{
  private:
    vector<Modification> _modifications;
    shared_ptr<Fichier> _fichier;
    mutex _mutex;

  public:
    ZoneTransit() = default;

    ZoneTransit(const shared_ptr<Fichier>& fichier) noexcept
      : _modifications{}
			, _fichier{fichier}
      , _mutex{}
    {}

		//ajoute les Modifications par ordre croissant de leur position
    void add(Modification m)
		{
			assert(m.getFichier() == _fichier);
			lock_guard<mutex> lock{_mutex};

			if(_modifications.empty())
			{
				_modifications.push_back(m);
			}

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
			assert(!_modifications.empty());
			lock_guard<mutex> lock{_mutex};
			
			if(!_modifications.empty())
			{
				Modification m = _modifications.back();
				_modifications.pop_back();
				return m;
			}
			return Modification{};
		}
};

#endif //ZONE_TRANSIT

