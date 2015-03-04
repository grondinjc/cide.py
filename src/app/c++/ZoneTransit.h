/****************************************************************************
 *  Classe:       ZoneTransit                                               *
 *  Auteur:       Mariane Maynard                                           *
 *  Description:  Classe servant a stocker temporairement les modifications *
 *                d'un fichier sur le serveur en attendant d'etre resolues  *
 ****************************************************************************/

#include <vector>
#include <mutex>
#include "Modification.h"
#include "Fichier.h"
#include "Types.h"

#ifndef ZONE_TRANSIT
#define ZONE_TRANSIT

using std::vector;
using std::mutex;
using std::lock_guard;
using std::string;
using boost::shared_ptr;
using namespace types;

class ZoneTransit
{
  public:
    using ModificationPtr = shared_ptr<Modification>;
  private:
    vector<ModificationPtr> _modifications;
    Fichier _fichier;
    mutex _mutex;

  public:
    ZoneTransit() = default;

    ZoneTransit(const string& contenu) noexcept
      : _modifications{}
      , _fichier{contenu}
      , _mutex{}
    {}

    //ajoute les Modifications par ordre croissant de leur position
    void add(const ModificationPtr& m)
    {
      lock_guard<mutex> lock{_mutex};

      _modifications.push_back(m);

    }

    //effectue les modifications
    void ecrireModifications()
    {
      lock_guard<mutex> lock{_mutex};

      for(auto it = _modifications.begin(); it != _modifications.end(); ++it)
      {
        (*it)->effectuerModification(_fichier);
        mettreAJourModifications(it);
      }

      _modifications.clear();
    }

    string getContenu() const {return _fichier.getContenu();}

    bool estVide() const noexcept {return _modifications.empty();}

  private:
    void mettreAJourModifications(vector<ModificationPtr>::iterator it)
    {
      Modification& modification = **it;
      for(++it; it != _modifications.end(); ++it)
      {
        (*it)->mettreAJour(modification);
      }
    }
};

#endif //ZONE_TRANSIT

