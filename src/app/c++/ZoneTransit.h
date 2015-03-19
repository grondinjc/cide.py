/****************************************************************************
 *  Classe:       ZoneTransit                                               *
 *  Auteur:       Mariane Maynard                                           *
 *  Description:  Classe servant a stocker temporairement les modifications *
 *                d'un fichier sur le serveur en attendant d'etre resolues  *
 ****************************************************************************/

#include <vector>
#include <mutex>
#include <boost/python/tuple.hpp>
#include "PaquetModifications.h"
#include "Fichier.h"
#include "Types.h"

#ifndef ZONE_TRANSIT
#define ZONE_TRANSIT

using std::vector;
using std::mutex;
using std::lock_guard;
using std::string;

using namespace types;

class ZoneTransit
{
  private:
    vector<PaquetModifications> _paquetModifications;
    vector<ModificationPtr> _modifications;
    Fichier _fichier;
    mutex _mutex;

  public:
    ZoneTransit() = default;

    ZoneTransit(const string& contenu) noexcept
      : _paquetModifications{}
      , _fichier{contenu}
      , _mutex{}
    {}

    //ajoute la modification a la liste
    void add(const vector<ModificationPtr>& pm)
    {
      lock_guard<mutex> lock{_mutex};

      _paquetModifications.push_back(PaquetModifications(pm));
      _modifications.insert(_modifications.end(), pm.begin(), pm.end());
    }

    void add(const ModificationPtr& m)
    {
      lock_guard<mutex> lock{_mutex};

      _paquetModifications.push_back(PaquetModifications(vector<ModificationPtr>(1,m)));
      _modifications.push_back(m);
    }

    //effectue les modifications
    boost::python::tuple ecrireModifications()
    {
      lock_guard<mutex> lock{_mutex};

      for(auto it = _paquetModifications.begin(); it != _paquetModifications.end(); ++it)
      {
        it->effectuerModification(_fichier);
        mettreAJourModifications(it);
      }

      boost::python::tuple modifications = boost::python::make_tuple(0,_modifications);

      _paquetModifications.clear();
      _modifications.clear();

      return modifications;
    }

    string getContenu() const {return _fichier.getContenu();}

    bool estVide() const noexcept {return _modifications.empty();}

  private:
    void mettreAJourModifications(vector<PaquetModifications>::iterator it)
    {
      PaquetModifications& modification = *it;
      for(++it; it != _paquetModifications.end(); ++it)
      {
        it->mettreAJour(modification);
      }
    }
};

#endif //ZONE_TRANSIT

