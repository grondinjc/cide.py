/****************************************************************************
 *  Classe:       Ajout                                                     *
 *  Auteur:       Mariane Maynard                                           *
 *  Description:  Representation d'un ajout de l'utilisateur                *
 ****************************************************************************/

#ifndef AJOUT
#define AJOUT

#include "Fichier.h"
#include "Types.h"

using namespace boost::python;
using boost::shared_ptr;
using namespace types;

class Ajout : public Modification
{
  private:
    string _data;
    
  public:
    Ajout() = default;

    Ajout(pos_t position, size_t taille, const char* data)
      : Modification(position, taille)
      , _data{data}
    {}

    Ajout(pos_t position, size_t taille, const string& data)
      : Modification(position, taille)
      , _data{data}
    {}

    Ajout(pos_t position, const string& data)
      : Modification(position, data.size())
      , _data{data}
    {}

    Ajout(pos_t position, const char* data)
      : Modification(position, strlen(data))
      , _data{data}
    {}

    virtual void effectuerModification(Fichier& fichier) override
    {
      fichier.inserer(_data.c_str(), getPosition(), getTaille());
    }
};

#endif //AJOUT
