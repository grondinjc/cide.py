/********************************************************************************
 *  Classe:       PaquetModifications                                           *
 *  Auteur:       Mariane Maynard                                               *
 *  Description:  Encapsulation d'un ensemble de modifications de l'utilisateur *
 ********************************************************************************/

#ifndef PAQUET_MODIFICATIONS
#define PAQUET_MODIFICATIONS

#include "Modification.h"
#include "Types.h"
#include <vector>

using std::vector;
using boost::shared_ptr;
using namespace types;

namespace types
{
  using ModificationPtr = shared_ptr<Modification>;
};

class PaquetModifications
{
  private:
    vector<ModificationPtr> _modifications;
    //size_t _taille;
    //uint _versionID;

  public:
    PaquetModifications() = default;

    PaquetModifications(const vector<ModificationPtr>& modifications)
      : _modifications{modifications}
    {}

    //ajoute la modification a la liste
    void add(const ModificationPtr& m)
    {
      _modifications.push_back(m);
    }

    void mettreAJour(const PaquetModifications& pm1)
    {
      for(ModificationPtr modifThis : _modifications)
      {
        for(ModificationPtr modifPm1 : pm1._modifications)
        {
          modifThis->mettreAJour(*modifPm1);
        }
      }
    }

    void effectuerModification(Fichier& fichier)
    {
      for(ModificationPtr modifPm1 : _modifications)
      {
        modifPm1->effectuerModification(fichier);
      }
    }
};

#endif //PAQUET_MODIFICATIONS
