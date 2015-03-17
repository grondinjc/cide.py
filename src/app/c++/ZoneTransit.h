/****************************************************************************
 *  Classe:       ZoneTransit                                               *
 *  Auteur:       Mariane Maynard                                           *
 *  Description:  Classe servant a stocker temporairement les modifications *
 *                d'un fichier sur le serveur en attendant d'etre resolues  *
 ****************************************************************************/

#include <vector>
#include <mutex>
#include <boost/python/tuple.hpp>
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

namespace types
{
  using ModificationPtr = shared_ptr<Modification>;
};

class Zut{};

class ZoneTransit
{
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

    //ajoute la modification a la liste
    void add(const ModificationPtr& m)
    {
      lock_guard<mutex> lock{_mutex};

      _modifications.push_back(m);

    }

    //effectue les modifications
    boost::python::tuple ecrireModifications()
    {
      lock_guard<mutex> lock{_mutex};

      for(auto it = _modifications.begin(); it != _modifications.end(); ++it)
      {
        (*it)->effectuerModification(_fichier);
        mettreAJourModifications(it);
      }

      boost::python::tuple modifications = boost::python::make_tuple(0,_modifications);

      _modifications.clear();

      return modifications;
    }

    string getContenu() const {return _fichier.getContenu();}

    bool estVide() const noexcept {return _modifications.empty();}

    void throwZut() {throw Zut{};}

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

