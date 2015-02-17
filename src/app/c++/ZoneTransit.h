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
	public:
		using ModificationPtr = shared_ptr<Modification>;
		using FichierPtr = shared_ptr<Fichier>;
  private:
    vector<ModificationPtr> _modifications;
    FichierPtr _fichier;
    mutex _mutex;

  public:
    ZoneTransit() = default;

    ZoneTransit(const FichierPtr& fichier) noexcept
      : _modifications{}
			, _fichier{fichier}
      , _mutex{}
    {}

		//ajoute les Modifications par ordre croissant de leur position
    void add(const ModificationPtr& m)
		{
			assert(m->getFichier() == _fichier);
			lock_guard<mutex> lock{_mutex};

			if(_modifications.empty())
			{
				_modifications.push_back(m);
			}

			//cette idee ne fonctionnera peut-etre plus etant donne les cas limites enumeres...
			for(auto it = _modifications.begin(); it != _modifications.end(); ++it)
			{
				if((*it)->getPosition() > m->getPosition())
				{
					_modifications.insert(it,m);
					break;
				}
			}
		}

		//enleve et retourne le dernier element (avec la plus grande position)
    ModificationPtr remove()
		{
			assert(!_modifications.empty());
			lock_guard<mutex> lock{_mutex};
			
			if(!_modifications.empty())
			{
				ModificationPtr m = _modifications.back();
				_modifications.pop_back();
				return m;
			}
			return ModificationPtr{};
		}

		//effectue les modifications
		void ecrireModifications()
		{
			for(auto it = _modifications.begin(); it != _modifications.end(); ++it)
			{
				(*it)->effectuerModification();
			}
		}
};

#endif //ZONE_TRANSIT

